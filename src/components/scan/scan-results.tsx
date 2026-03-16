"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle, Info, ThumbsUp } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { StatusBadge } from "@/components/ui/status-badge";
import { FindingCard } from "@/components/ui/finding-card";
import { cn } from "@/lib/utils";

interface ScanResultsProps {
  scanId: string;
}

interface ScanData {
  id: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  status: string;
  profile: string;
  score: number | null;
  findings: Finding[] | null;
  summary: Summary | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Finding {
  severity: string;
  category: string;
  title: string;
  file?: string;
  line?: number;
  description: string;
  codeSnippet?: string;
  fix?: string;
  cwe?: string;
  owasp?: string;
}

interface Summary {
  critical: number;
  warning: number;
  suggestion: number;
  good: number;
  filesAnalyzed: number;
  score: number;
}

type FilterSeverity = "all" | "critical" | "warning" | "suggestion" | "good";

export function ScanResults({ scanId }: ScanResultsProps) {
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterSeverity>("all");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function fetchScan() {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (res.ok) {
          const data = await res.json();
          setScan(data);

          if (data.status === "completed" || data.status === "failed") {
            clearInterval(interval);
            setLoading(false);
          }
        }
      } catch {
        clearInterval(interval);
        setLoading(false);
      }
    }

    fetchScan().then(() => setLoading(false));

    interval = setInterval(fetchScan, 3000);
    return () => clearInterval(interval);
  }, [scanId]);

  if (loading && !scan) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-sentinel-500 dark:text-sentinel-400 animate-spin" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="py-20 text-center text-sm text-zinc-500">
        Scan not found
      </div>
    );
  }

  const isRunning = scan.status === "scanning" || scan.status === "cloning" || scan.status === "queued";
  const findings = (scan.findings as Finding[] | null) || [];
  const summary = scan.summary as Summary | null;

  const filteredFindings =
    filter === "all"
      ? findings
      : findings.filter((f) => f.severity === filter);

  const severityCounts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    suggestion: findings.filter((f) => f.severity === "suggestion").length,
    good: findings.filter((f) => f.severity === "good").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {scan.repoOwner}/{scan.repoName}
            </h2>
            <StatusBadge status={scan.status} />
          </div>
          <div className="flex items-center gap-3 text-[12px] text-zinc-500">
            <span className="font-mono">{scan.branch}</span>
            <span>&middot;</span>
            <span className="font-mono uppercase">{scan.profile}</span>
            <span>&middot;</span>
            <span>{new Date(scan.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {scan.score !== null && (
          <ScoreRing score={scan.score} size={72} strokeWidth={4} />
        )}
      </div>

      {/* Running state */}
      {isRunning && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-sentinel-500/20 bg-sentinel-500/5">
          <Loader2 className="w-4 h-4 text-sentinel-500 dark:text-sentinel-400 animate-spin" />
          <span className="text-sm text-sentinel-600 dark:text-sentinel-300">
            {scan.status === "queued"
              ? "Scan queued, waiting to start..."
              : scan.status === "cloning"
                ? "Cloning repository..."
                : "Scanning in progress..."}
          </span>
        </div>
      )}

      {/* Error */}
      {scan.status === "failed" && scan.error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">Scan failed</span>
          </div>
          <p className="text-[13px] text-red-600/70 dark:text-red-300/70 font-mono">{scan.error}</p>
        </div>
      )}

      {/* Summary stats */}
      {summary && scan.status === "completed" && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Critical", count: severityCounts.critical, icon: AlertTriangle, color: "text-red-500" },
            { label: "Warning", count: severityCounts.warning, icon: AlertTriangle, color: "text-amber-500" },
            { label: "Suggestion", count: severityCounts.suggestion, icon: Info, color: "text-blue-500" },
            { label: "Good", count: severityCounts.good, icon: ThumbsUp, color: "text-emerald-500" },
            { label: "Files", count: summary.filesAnalyzed, icon: CheckCircle, color: "text-zinc-500 dark:text-zinc-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className={cn("w-3 h-3", stat.color)} />
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                  {stat.label}
                </span>
              </div>
              <span className={cn("text-xl font-semibold tabular-nums", stat.color)}>
                {stat.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Findings */}
      {scan.status === "completed" && findings.length > 0 && (
        <>
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-sentinel-800/40 pb-3">
            {(["all", "critical", "warning", "suggestion", "good"] as const).map((sev) => {
              const count =
                sev === "all"
                  ? findings.length
                  : severityCounts[sev];

              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFilter(sev)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer",
                    filter === sev
                      ? "bg-sentinel-500/10 text-sentinel-600 dark:text-sentinel-300"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  )}
                >
                  {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
                  <span className="ml-1 font-mono text-[10px] opacity-60">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Finding cards */}
          <div className="space-y-2">
            {filteredFindings.map((finding, i) => (
              <FindingCard key={`${finding.title}-${i}`} finding={finding} />
            ))}
          </div>
        </>
      )}

      {scan.status === "completed" && findings.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500 mb-3" />
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">All clear</h3>
          <p className="mt-1 text-[13px] text-zinc-500">
            No security findings detected
          </p>
        </div>
      )}
    </div>
  );
}
