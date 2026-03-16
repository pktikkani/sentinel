"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Play,
  Loader2,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  ChevronDown,
  Clock,
  Target,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";

interface UrlScanRecord {
  id: string;
  targets: string[];
  profile: string;
  status: string;
  findings: Finding[] | null;
  checks: Check[] | null;
  stats: { targetsScanned: number; checksRun: number; findingsFound: number } | null;
  error: string | null;
  createdAt: string;
}

interface Finding {
  title: string;
  severity: string;
  confidence: number;
  description: string;
  remediation?: string;
  asset?: string;
  cwe?: string;
  owasp?: string;
  evidence?: { excerpt: string }[];
}

interface Check {
  check: string;
  status: "pass" | "fail" | "warn" | "error" | "info";
  detail: string;
}

export function UrlScanView() {
  const [targets, setTargets] = useState("");
  const [profile, setProfile] = useState("active");
  const [scanning, setScanning] = useState(false);
  const [scans, setScans] = useState<UrlScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchScans = useCallback(async () => {
    try {
      const res = await fetch("/api/url-scans");
      if (res.ok) setScans(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // Poll for in-progress scans
  useEffect(() => {
    const hasActive = scans.some((s) => s.status === "scanning" || s.status === "queued");
    if (!hasActive) return;
    const interval = setInterval(fetchScans, 3000);
    return () => clearInterval(interval);
  }, [scans, fetchScans]);

  async function handleScan() {
    const targetList = targets
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (targetList.length === 0) return;

    setScanning(true);
    try {
      const res = await fetch("/api/url-scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets: targetList, profile }),
      });

      if (res.ok) {
        setTargets("");
        fetchScans();
      }
    } finally {
      setScanning(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/url-scans/${id}`, { method: "DELETE" });
      setScans((prev) => prev.filter((s) => s.id !== id));
      if (expandedId === id) setExpandedId(null);
    } finally {
      setDeletingId(null);
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case "fail":
        return <XCircle className="w-3 h-3 text-red-500" />;
      case "warn":
        return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      case "error":
        return <XCircle className="w-3 h-3 text-zinc-400" />;
      case "info":
        return <Info className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case "critical":
        return "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20";
      case "warning":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="p-5 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-sentinel-500" />
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Scan URLs
          </span>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
            placeholder="https://example.com, https://api.example.com"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-sentinel-950 border border-zinc-200 dark:border-sentinel-800/50 text-[13px] text-zinc-700 dark:text-zinc-300 font-mono focus:outline-none focus:border-sentinel-500 dark:focus:border-sentinel-600 placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-zinc-400" />
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-sentinel-950 border border-zinc-200 dark:border-sentinel-800/50 text-[12px] text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-sentinel-500"
              >
                <option value="passive">Passive</option>
                <option value="active">Active</option>
                <option value="exploit">Exploit</option>
              </select>
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 flex-1">
              {profile === "passive" && "Headers, TLS, DNS, cookies only — no active probing"}
              {profile === "active" && "Includes path probing, method testing, redirect checks"}
              {profile === "exploit" && "Full testing including all active checks"}
            </p>

            <button
              type="button"
              onClick={handleScan}
              disabled={scanning || !targets.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sentinel-500/15 border border-sentinel-500/25 text-[13px] font-medium text-sentinel-600 dark:text-sentinel-300 transition-all hover:bg-sentinel-500/20 hover:border-sentinel-500/35 disabled:opacity-50 cursor-pointer"
            >
              {scanning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Scan
            </button>
          </div>
        </div>
      </div>

      {/* Scan history */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-4 h-4 text-sentinel-500 animate-spin" />
        </div>
      ) : scans.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No URL scans yet</p>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-600 mt-1">
            Enter URLs above and click Scan to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => {
            const isExpanded = expandedId === scan.id;
            const isActive = scan.status === "scanning" || scan.status === "queued";

            return (
              <div
                key={scan.id}
                className="rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20 overflow-hidden"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                  className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-zinc-50 dark:hover:bg-sentinel-900/40 transition-colors"
                >
                  {isActive ? (
                    <Loader2 className="w-4 h-4 text-sentinel-500 animate-spin shrink-0" />
                  ) : scan.status === "failed" ? (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono text-zinc-700 dark:text-zinc-300 truncate">
                        {scan.targets.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                        {scan.profile}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                        {timeAgo(scan.createdAt)}
                      </span>
                      {scan.stats && (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                          {scan.stats.checksRun} checks &middot; {scan.stats.findingsFound} findings
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(scan.id);
                    }}
                    disabled={deletingId === scan.id}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    {deletingId === scan.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>

                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-zinc-400 transition-transform shrink-0",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>

                {/* Expanded details */}
                {isExpanded && scan.status === "completed" && (
                  <div className="border-t border-zinc-200 dark:border-sentinel-800/40 p-4 space-y-4">
                    {/* Stats */}
                    {scan.stats && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-sentinel-950/50 border border-zinc-200 dark:border-sentinel-800/30">
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-wider block">
                            Targets
                          </span>
                          <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                            {scan.stats.targetsScanned}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-sentinel-950/50 border border-zinc-200 dark:border-sentinel-800/30">
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-wider block">
                            Checks
                          </span>
                          <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                            {scan.stats.checksRun}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-sentinel-950/50 border border-zinc-200 dark:border-sentinel-800/30">
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-wider block">
                            Findings
                          </span>
                          <span className={cn(
                            "text-lg font-semibold tabular-nums",
                            scan.stats.findingsFound > 0 ? "text-red-500" : "text-emerald-500"
                          )}>
                            {scan.stats.findingsFound}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Checks */}
                    {scan.checks && scan.checks.length > 0 && (
                      <div>
                        <h3 className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                          <Target className="w-3 h-3" />
                          Checks
                        </h3>
                        <div className="space-y-1">
                          {scan.checks.map((check, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-sentinel-950/30"
                            >
                              {statusIcon(check.status)}
                              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {check.detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Findings */}
                    {scan.findings && scan.findings.length > 0 && (
                      <div>
                        <h3 className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3" />
                          Findings
                        </h3>
                        <div className="space-y-2">
                          {scan.findings.map((finding, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg border border-zinc-200 dark:border-sentinel-800/30 bg-white dark:bg-sentinel-900/10"
                            >
                              <div className="flex items-start gap-2">
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0",
                                    severityColor(finding.severity)
                                  )}
                                >
                                  {finding.severity}
                                </span>
                                <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200">
                                  {finding.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                                {finding.description}
                              </p>
                              {finding.remediation && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 leading-relaxed">
                                  Fix: {finding.remediation}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                {finding.cwe && (
                                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
                                    {finding.cwe}
                                  </span>
                                )}
                                {finding.owasp && (
                                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
                                    {finding.owasp}
                                  </span>
                                )}
                                {finding.asset && (
                                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 truncate ml-auto">
                                    {finding.asset}
                                  </span>
                                )}
                              </div>
                              {finding.evidence && finding.evidence.length > 0 && (
                                <pre className="mt-2 p-2 rounded bg-zinc-100 dark:bg-sentinel-950/50 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                                  {finding.evidence[0].excerpt}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {scan.findings?.length === 0 && (
                      <div className="text-center py-6">
                        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No security issues found</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Error state */}
                {isExpanded && scan.status === "failed" && (
                  <div className="border-t border-zinc-200 dark:border-sentinel-800/40 p-4">
                    <p className="text-[12px] text-red-500 font-mono">{scan.error}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
