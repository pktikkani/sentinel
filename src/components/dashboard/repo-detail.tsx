"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Loader2,
  History,
  GitBranch,
  ShieldCheck,
  ChevronDown,
  Shield,
  Code,
  Package,
  Scale,
  FileCheck,
  Repeat,
  AlertTriangle,
  Wrench,
  Check,
  X,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo } from "@/lib/utils";

interface RepoDetailProps {
  owner: string;
  repo: string;
}

interface Scan {
  id: string;
  repoOwner: string;
  repoName: string;
  status: string;
  profile: string;
  score: number | null;
  branch: string;
  createdAt: string;
}

interface Branch {
  name: string;
  protected: boolean;
}

interface ToolInfo {
  id: string;
  binary: string;
  risk: string;
  requiresTarget: boolean;
  notes?: string;
  installed: boolean;
  inProfile: boolean;
}

const COMPLIANCE_FRAMEWORKS = [
  { id: "soc2", label: "SOC 2" },
  { id: "pci-dss", label: "PCI DSS" },
  { id: "hipaa", label: "HIPAA" },
  { id: "nist-800-53", label: "NIST 800-53" },
  { id: "gdpr", label: "GDPR" },
  { id: "dpdpa", label: "DPDPA" },
  { id: "iso-27001", label: "ISO 27001" },
];

export function RepoDetail({ owner, repo }: RepoDetailProps) {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Branch state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branch, setBranch] = useState("main");

  // Scan config
  const [profile, setProfile] = useState<string>("active");
  const [codeAnalysis, setCodeAnalysis] = useState<string>("focused");
  const [severity, setSeverity] = useState<string>("suggestion");
  const [sca, setSca] = useState(true);
  const [licenseCheck, setLicenseCheck] = useState(false);
  const [licensePolicy, setLicensePolicy] = useState<string>("commercial");
  const [compliance, setCompliance] = useState<string[]>([]);
  const [multiPass, setMultiPass] = useState(true);
  const [maxPass2Findings, setMaxPass2Findings] = useState(30);
  // External tools
  const [runExternalTools, setRunExternalTools] = useState(false);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolTimeout, setToolTimeout] = useState(120);

  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await fetch(`/api/repos/${owner}/${repo}/branches`);
      if (res.ok) {
        const data: Branch[] = await res.json();
        setBranches(data);
        if (data.length > 0 && !data.some((b) => b.name === branch)) {
          setBranch(data[0].name);
        }
      }
    } finally {
      setBranchesLoading(false);
    }
  }, [owner, repo, branch]);

  const fetchTools = useCallback(async () => {
    setToolsLoading(true);
    try {
      const res = await fetch(`/api/tools?profile=${profile}`);
      if (res.ok) {
        const data: ToolInfo[] = await res.json();
        setTools(data);
        // Default: select all installed tools that match the profile
        setSelectedTools(
          data.filter((t) => t.installed && t.inProfile).map((t) => t.id)
        );
      }
    } finally {
      setToolsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    async function fetchScans() {
      try {
        const res = await fetch("/api/scans");
        if (res.ok) {
          const allScans: Scan[] = await res.json();
          setScans(
            allScans.filter(
              (s) => s.repoOwner === owner && s.repoName === repo
            )
          );
        }
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
    fetchBranches();
  }, [owner, repo, fetchBranches]);

  // Fetch tools when config panel is opened or profile changes
  useEffect(() => {
    if (showConfig && runExternalTools) {
      fetchTools();
    }
  }, [showConfig, runExternalTools, fetchTools]);

  function toggleCompliance(framework: string) {
    setCompliance((prev) =>
      prev.includes(framework)
        ? prev.filter((f) => f !== framework)
        : [...prev, framework]
    );
  }

  function toggleTool(toolId: string) {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((t) => t !== toolId)
        : [...prev, toolId]
    );
  }

  async function handleStartScan() {
    setStarting(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: owner,
          repoName: repo,
          repoUrl: `https://github.com/${owner}/${repo}`,
          branch,
          config: {
            profile,
            codeAnalysis,
            severity,
            sca,
            licenseCheck,
            licensePolicy,
            compliance,
            multiPass,
            maxPass2Findings,
            runExternalTools,
            selectedTools: runExternalTools ? selectedTools : [],
            toolTimeout,
          },
        }),
      });

      if (res.ok) {
        const scan = await res.json();
        router.push(`/dashboard/scans/${scan.id}`);
      }
    } finally {
      setStarting(false);
    }
  }

  const riskColor = (risk: string) => {
    switch (risk) {
      case "passive":
        return "text-emerald-500";
      case "active":
        return "text-amber-500";
      case "exploit":
        return "text-red-500";
      default:
        return "text-zinc-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Repo header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {owner}/{repo}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <GitBranch className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
            <span className="text-[12px] text-zinc-500 font-mono">
              {branch}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer",
              showConfig
                ? "border-sentinel-500/30 text-sentinel-600 dark:text-sentinel-300 bg-sentinel-500/5"
                : "border-zinc-200 dark:border-sentinel-800/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-sentinel-700/50"
            )}
          >
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform",
                showConfig && "rotate-180"
              )}
            />
            Config
          </button>

          <button
            type="button"
            onClick={handleStartScan}
            disabled={starting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sentinel-500/15 border border-sentinel-500/25 text-[13px] font-medium text-sentinel-600 dark:text-sentinel-300 transition-all hover:bg-sentinel-500/20 hover:border-sentinel-500/35 disabled:opacity-50 cursor-pointer"
          >
            {starting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {starting ? "Starting..." : "Run Scan"}
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="space-y-4 p-5 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20">
          {/* Row 1: Branch, Profile, Code Analysis, Severity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <ConfigLabel icon={<GitBranch className="w-3 h-3" />} text="Branch" />
              {branchesLoading ? (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-sentinel-950 border border-zinc-200 dark:border-sentinel-800/50 text-[12px] text-zinc-400 dark:text-zinc-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </div>
              ) : (
                <ConfigSelect
                  value={branch}
                  onChange={setBranch}
                  options={
                    branches.length > 0
                      ? branches.map((b) => ({
                          value: b.name,
                          label: b.name + (b.protected ? " 🔒" : ""),
                        }))
                      : [{ value: branch, label: branch }]
                  }
                  mono
                />
              )}
            </div>

            <div>
              <ConfigLabel icon={<Shield className="w-3 h-3" />} text="Profile" />
              <ConfigSelect
                value={profile}
                onChange={setProfile}
                options={[
                  { value: "passive", label: "Passive" },
                  { value: "active", label: "Active" },
                  { value: "exploit", label: "Exploit" },
                ]}
              />
            </div>

            <div>
              <ConfigLabel icon={<Code className="w-3 h-3" />} text="Code Analysis" />
              <ConfigSelect
                value={codeAnalysis}
                onChange={setCodeAnalysis}
                options={[
                  { value: "off", label: "Off" },
                  { value: "focused", label: "Focused" },
                  { value: "full", label: "Full" },
                ]}
              />
            </div>

            <div>
              <ConfigLabel icon={<AlertTriangle className="w-3 h-3" />} text="Severity" />
              <ConfigSelect
                value={severity}
                onChange={setSeverity}
                options={[
                  { value: "suggestion", label: "Suggestion" },
                  { value: "warning", label: "Warning" },
                  { value: "critical", label: "Critical" },
                ]}
              />
            </div>
          </div>

          {/* Row 2: Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <ToggleOption label="SCA" icon={<Package className="w-3 h-3" />} enabled={sca} onToggle={() => setSca(!sca)} />
            <ToggleOption label="License Check" icon={<Scale className="w-3 h-3" />} enabled={licenseCheck} onToggle={() => setLicenseCheck(!licenseCheck)} />
            <ToggleOption label="Multi-Pass" icon={<Repeat className="w-3 h-3" />} enabled={multiPass} onToggle={() => setMultiPass(!multiPass)} />
            <ToggleOption label="Run Tools" icon={<Wrench className="w-3 h-3" />} enabled={runExternalTools} onToggle={() => setRunExternalTools(!runExternalTools)} />
          </div>

          {/* Row 3: Conditional fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {licenseCheck && (
              <div>
                <ConfigLabel icon={<Scale className="w-3 h-3" />} text="License Policy" />
                <ConfigSelect
                  value={licensePolicy}
                  onChange={setLicensePolicy}
                  options={[
                    { value: "commercial", label: "Commercial" },
                    { value: "open-source", label: "Open Source" },
                    { value: "permissive-only", label: "Permissive Only" },
                  ]}
                />
              </div>
            )}

            {multiPass && (
              <div>
                <ConfigLabel icon={<Repeat className="w-3 h-3" />} text={`Max Pass 2 (${maxPass2Findings})`} />
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={maxPass2Findings}
                  onChange={(e) => setMaxPass2Findings(Number(e.target.value))}
                  className="w-full h-1.5 mt-2 rounded-full appearance-none bg-zinc-200 dark:bg-sentinel-800/50 accent-sentinel-500"
                />
              </div>
            )}

            {runExternalTools && (
              <div>
                <ConfigLabel icon={<Clock className="w-3 h-3" />} text={`Tool Timeout (${toolTimeout}s)`} />
                <input
                  type="range"
                  min={10}
                  max={600}
                  step={10}
                  value={toolTimeout}
                  onChange={(e) => setToolTimeout(Number(e.target.value))}
                  className="w-full h-1.5 mt-2 rounded-full appearance-none bg-zinc-200 dark:bg-sentinel-800/50 accent-sentinel-500"
                />
              </div>
            )}
          </div>

          {/* External tools picker */}
          {runExternalTools && (
            <div>
              <ConfigLabel icon={<Wrench className="w-3 h-3" />} text="External Security Tools" />
              {toolsLoading ? (
                <div className="flex items-center gap-2 py-3 text-[12px] text-zinc-400 dark:text-zinc-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading tool catalog...
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {/* Quick actions */}
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTools(
                          tools.filter((t) => t.installed && t.inProfile).map((t) => t.id)
                        )
                      }
                      className="text-[11px] text-sentinel-500 hover:text-sentinel-400 cursor-pointer"
                    >
                      Select profile defaults
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTools(tools.filter((t) => t.installed).map((t) => t.id))
                      }
                      className="text-[11px] text-sentinel-500 hover:text-sentinel-400 cursor-pointer"
                    >
                      Select all installed
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTools([])}
                      className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer"
                    >
                      Clear
                    </button>
                    <span className="ml-auto text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
                      {selectedTools.length}/{tools.filter((t) => t.installed).length} selected
                    </span>
                  </div>

                  {/* Tool grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        disabled={!tool.installed}
                        onClick={() => toggleTool(tool.id)}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-mono border transition-colors text-left",
                          !tool.installed
                            ? "opacity-40 border-zinc-200 dark:border-sentinel-800/30 bg-zinc-100 dark:bg-sentinel-950/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                            : selectedTools.includes(tool.id)
                              ? "bg-sentinel-500/10 border-sentinel-500/25 text-sentinel-600 dark:text-sentinel-300 cursor-pointer"
                              : "bg-zinc-50 dark:bg-sentinel-950 border-zinc-200 dark:border-sentinel-800/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-sentinel-700 cursor-pointer"
                        )}
                        title={
                          !tool.installed
                            ? `${tool.binary} not installed`
                            : tool.notes || tool.id
                        }
                      >
                        {tool.installed ? (
                          selectedTools.includes(tool.id) ? (
                            <Check className="w-3 h-3 text-sentinel-500 shrink-0" />
                          ) : (
                            <div className="w-3 h-3 shrink-0" />
                          )
                        ) : (
                          <X className="w-3 h-3 text-zinc-400 dark:text-zinc-600 shrink-0" />
                        )}
                        <span className="truncate">{tool.id}</span>
                        <span
                          className={cn(
                            "ml-auto text-[9px] uppercase tracking-wider shrink-0",
                            riskColor(tool.risk)
                          )}
                        >
                          {tool.risk.charAt(0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance frameworks */}
          <div>
            <ConfigLabel icon={<FileCheck className="w-3 h-3" />} text="Compliance Frameworks" />
            <div className="flex flex-wrap gap-2 mt-1">
              {COMPLIANCE_FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => toggleCompliance(fw.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer",
                    compliance.includes(fw.id)
                      ? "bg-sentinel-500/15 border-sentinel-500/30 text-sentinel-600 dark:text-sentinel-300"
                      : "bg-zinc-50 dark:bg-sentinel-950 border-zinc-200 dark:border-sentinel-800/50 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 hover:border-zinc-300 dark:hover:border-sentinel-800"
                  )}
                >
                  {fw.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Past scans */}
      <div>
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          Previous Scans
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-4 h-4 text-sentinel-500 dark:text-sentinel-400 animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No scans yet"
            description="Run your first scan to get security insights"
          />
        ) : (
          <div className="space-y-2">
            {scans.map((scan) => (
              <a
                key={scan.id}
                href={`/dashboard/scans/${scan.id}`}
                className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20 transition-all duration-200 hover:border-zinc-300 dark:hover:border-sentinel-700/50 hover:bg-zinc-50 dark:hover:bg-sentinel-900/40"
              >
                {scan.score !== null ? (
                  <ScoreRing score={scan.score} size={36} strokeWidth={2.5} className="shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full border border-zinc-200 dark:border-sentinel-800/50 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">--</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={scan.status} />
                    <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 tracking-wider uppercase">
                      {scan.profile}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5 block">
                    {timeAgo(scan.createdAt)} &middot; {scan.branch}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-700 shrink-0">
                  {scan.id.slice(0, 8)}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mb-1.5 tracking-wider uppercase">
      {icon}
      {text}
    </label>
  );
}

function ConfigSelect({
  value,
  onChange,
  options,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  mono?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-sentinel-950 border border-zinc-200 dark:border-sentinel-800/50 text-[12px] text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-sentinel-500 dark:focus:border-sentinel-600",
        mono && "font-mono"
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ToggleOption({
  label,
  icon,
  enabled,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <ConfigLabel icon={icon} text={label} />
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full px-2.5 py-1.5 rounded-md text-[12px] font-medium border transition-colors cursor-pointer",
          enabled
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-zinc-50 dark:bg-sentinel-950 border-zinc-200 dark:border-sentinel-800/50 text-zinc-400 dark:text-zinc-500"
        )}
      >
        {enabled ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}
