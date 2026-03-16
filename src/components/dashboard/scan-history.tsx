"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, Loader2, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo } from "@/lib/utils";

interface Scan {
  id: string;
  repoOwner: string;
  repoName: string;
  status: string;
  profile: string;
  score: number | null;
  createdAt: string;
}

export function ScanHistory() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    fetchScans();
  }, []);

  async function fetchScans() {
    try {
      const res = await fetch("/api/scans");
      if (res.ok) {
        setScans(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/scans/${id}`, { method: "DELETE" });
      if (res.ok) {
        setScans((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleDeleteAll() {
    if (!confirm("Delete all scan results? This cannot be undone.")) return;
    setDeletingAll(true);
    try {
      const res = await fetch("/api/scans", { method: "DELETE" });
      if (res.ok) {
        setScans([]);
      }
    } finally {
      setDeletingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-sentinel-500 dark:text-sentinel-400 animate-spin" />
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No scans yet"
        description="Start a scan from any repository page"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={deletingAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
        >
          {deletingAll ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
          {deletingAll ? "Deleting..." : "Delete All"}
        </button>
      </div>

      {/* Scan list */}
      <div className="space-y-2">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20 transition-all duration-200 hover:border-zinc-300 dark:hover:border-sentinel-700/50 hover:bg-zinc-50 dark:hover:bg-sentinel-900/40"
          >
            <Link
              href={`/dashboard/scans/${scan.id}`}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              {scan.score !== null ? (
                <ScoreRing score={scan.score} size={44} strokeWidth={3} />
              ) : (
                <div className="w-11 h-11 rounded-full border border-zinc-200 dark:border-sentinel-800/50 flex items-center justify-center">
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600">--</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {scan.repoOwner}/{scan.repoName}
                  </span>
                  <StatusBadge status={scan.status} />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 tracking-wider">
                    {scan.profile.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                    {timeAgo(scan.createdAt)}
                  </span>
                </div>
              </div>

              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-700 shrink-0">
                {scan.id.slice(0, 8)}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => handleDelete(scan.id)}
              disabled={deleting === scan.id}
              className="p-2 rounded-md text-zinc-400 dark:text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="Delete scan"
            >
              {deleting === scan.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
