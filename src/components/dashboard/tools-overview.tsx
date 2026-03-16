"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolInfo {
  id: string;
  binary: string;
  risk: string;
  requiresTarget: boolean;
  notes?: string;
  installed: boolean;
  inProfile: boolean;
}

const RISK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  passive: { label: "Passive", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  active: { label: "Active", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  exploit: { label: "Exploit", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  nuclei: "Template-based vulnerability scanner by ProjectDiscovery",
  subfinder: "Subdomain enumeration tool",
  httpx: "HTTP probing and technology detection",
  nmap: "Network port scanner and service detection",
  ffuf: "Fast web fuzzer for directory/parameter discovery",
  gobuster: "Directory and vhost brute-force scanner",
  masscan: "High-speed TCP port scanner",
  testssl: "SSL/TLS configuration analysis",
  nikto: "Web server vulnerability scanner",
  dalfox: "XSS vulnerability scanner and parameter analysis",
  whatweb: "Web technology fingerprinting",
  wafw00f: "Web Application Firewall detection",
  arjun: "HTTP parameter discovery",
  paramspider: "URL parameter mining from web archives",
  sqlmap: "SQL injection detection and exploitation",
  hydra: "Network login credential brute-forcer",
  commix: "Command injection detection",
  trufflehog: "Secret and credential scanning in files/repos",
  gitleaks: "Git repository secret scanning",
  feroxbuster: "Recursive directory brute-forcer (Rust)",
  wpscan: "WordPress vulnerability scanner",
  sslyze: "SSL/TLS deep analysis and certificate checking",
  jwt_tool: "JWT token analysis and manipulation testing",
  promptfoo: "LLM prompt injection testing framework",
  garak: "LLM red-teaming and adversarial testing",
};

export function ToolsOverview() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<string>("active");

  useEffect(() => {
    async function fetchTools() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tools?profile=${profile}`);
        if (res.ok) {
          setTools(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, [profile]);

  const installed = tools.filter((t) => t.installed);
  const missing = tools.filter((t) => !t.installed);

  const byRisk = {
    passive: tools.filter((t) => t.risk === "passive"),
    active: tools.filter((t) => t.risk === "active"),
    exploit: tools.filter((t) => t.risk === "exploit"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-sentinel-500 dark:text-sentinel-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Tools"
          value={tools.length}
          color="text-zinc-700 dark:text-zinc-300"
        />
        <StatCard
          label="Installed"
          value={installed.length}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Missing"
          value={missing.length}
          color="text-red-500"
        />
        <div className="p-3 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20">
          <label className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block mb-1">
            Profile
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            className="w-full px-2 py-1 rounded-md bg-zinc-50 dark:bg-sentinel-950 border border-zinc-200 dark:border-sentinel-800/50 text-[12px] text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-sentinel-500"
          >
            <option value="passive">Passive</option>
            <option value="active">Active</option>
            <option value="exploit">Exploit</option>
          </select>
        </div>
      </div>

      {/* Tools by risk level */}
      {(["passive", "active", "exploit"] as const).map((risk) => {
        const riskTools = byRisk[risk];
        if (riskTools.length === 0) return null;
        const meta = RISK_LABELS[risk];

        return (
          <div key={risk}>
            <div className="flex items-center gap-2 mb-3">
              <Shield className={cn("w-4 h-4", meta.color)} />
              <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {meta.label} Tools
              </h2>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
                {riskTools.filter((t) => t.installed).length}/{riskTools.length} installed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {riskTools.map((tool) => (
                <div
                  key={tool.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    tool.installed
                      ? "border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20"
                      : "border-zinc-200/60 dark:border-sentinel-800/20 bg-zinc-50/50 dark:bg-sentinel-950/30 opacity-60"
                  )}
                >
                  {tool.installed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-600 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 font-mono">
                        {tool.id}
                      </span>
                      {tool.inProfile && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-sentinel-500/10 text-sentinel-600 dark:text-sentinel-300 border border-sentinel-500/20">
                          {profile}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                      {TOOL_DESCRIPTIONS[tool.id] || tool.notes || `Binary: ${tool.binary}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", meta.bg, meta.color)}>
                        {meta.label}
                      </span>
                      {tool.requiresTarget && (
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
                          needs target URL
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 ml-auto">
                        {tool.binary}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Install help */}
      {missing.length > 0 && (
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-zinc-50 dark:bg-sentinel-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Missing Tools
            </h3>
          </div>
          <p className="text-[12px] text-zinc-500 mb-2">
            The following tools are not installed on this server. Install them to enable additional scanning capabilities.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((tool) => (
              <span
                key={tool.id}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-zinc-100 dark:bg-sentinel-950 border border-zinc-200 dark:border-sentinel-800/50 text-zinc-600 dark:text-zinc-400"
              >
                {tool.binary}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20">
      <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block mb-1">
        {label}
      </span>
      <span className={cn("text-xl font-semibold tabular-nums", color)}>
        {value}
      </span>
    </div>
  );
}
