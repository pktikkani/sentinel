"use client";

import { useState } from "react";
import { ChevronDown, FileCode, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "./severity-badge";

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

interface FindingCardProps {
  finding: Finding;
}

export function FindingCard({ finding }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-zinc-200 dark:border-sentinel-800/50 rounded-lg bg-white dark:bg-sentinel-900/30 overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-sentinel-700/50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <SeverityBadge severity={finding.severity} />
            {finding.category && (
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600 tracking-wider">
                {finding.category}
              </span>
            )}
          </div>
          <h4 className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
            {finding.title}
          </h4>
          {finding.file && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <FileCode className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
              <span className="text-[11px] font-mono text-zinc-500 truncate">
                {finding.file}
                {finding.line && `:${finding.line}`}
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-400 dark:text-zinc-600 transition-transform duration-200 mt-1 shrink-0",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-200 dark:border-sentinel-800/30 pt-3">
          <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {finding.description}
          </p>

          {finding.codeSnippet && (
            <pre className="p-3 rounded-md bg-zinc-50 dark:bg-sentinel-950 border border-zinc-200 dark:border-sentinel-800/40 text-[12px] font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto whitespace-pre-wrap">
              {finding.codeSnippet}
            </pre>
          )}

          {finding.fix && (
            <div className="p-3 rounded-md bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span className="text-[11px] font-mono font-medium text-emerald-500 tracking-wider uppercase">
                  Fix
                </span>
              </div>
              <p className="text-[12px] text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
                {finding.fix}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {finding.cwe && (
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 tracking-wider">
                {finding.cwe}
              </span>
            )}
            {finding.owasp && (
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 tracking-wider">
                {finding.owasp}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
