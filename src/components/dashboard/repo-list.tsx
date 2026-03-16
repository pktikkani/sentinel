"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Lock,
  Globe,
  Star,
  GitFork,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { GitHubRepo } from "@/lib/github";

export function RepoList() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/repos?per_page=100");
        if (!res.ok) throw new Error("Failed to fetch repositories");
        const data = await res.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-sentinel-500 dark:text-sentinel-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Globe}
        title="Failed to load repositories"
        description={error}
      />
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-sentinel-900/50 border border-zinc-200 dark:border-sentinel-800/50 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-sentinel-500 dark:focus:border-sentinel-600 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-zinc-400 dark:text-zinc-700">
          {filtered.length} repos
        </span>
      </div>

      {/* Repo grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No repositories found"
          description="Try a different search term"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((repo) => (
            <Link
              key={repo.id}
              href={`/dashboard/${repo.owner.login}/${repo.name}`}
              className="group flex flex-col gap-2.5 p-4 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20 transition-all duration-200 hover:border-zinc-300 dark:hover:border-sentinel-700/50 hover:bg-zinc-50 dark:hover:bg-sentinel-900/40"
            >
              <div className="flex items-center gap-2">
                <img
                  src={repo.owner.avatar_url}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-sentinel-600 dark:group-hover:text-white transition-colors">
                  {repo.full_name}
                </span>
                {repo.private ? (
                  <Lock className="w-3 h-3 text-zinc-400 dark:text-zinc-600 shrink-0" />
                ) : (
                  <Globe className="w-3 h-3 text-zinc-400 dark:text-zinc-600 shrink-0" />
                )}
              </div>

              {repo.description && (
                <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-auto">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        languageColor(repo.language)
                      )}
                    />
                    <span className="text-[11px] text-zinc-500">
                      {repo.language}
                    </span>
                  </span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-600">
                    <Star className="w-3 h-3" />
                    {repo.stargazers_count}
                  </span>
                )}
                {repo.fork && (
                  <GitFork className="w-3 h-3 text-zinc-400 dark:text-zinc-700" />
                )}
                <span className="ml-auto font-mono text-[10px] text-zinc-400 dark:text-zinc-700">
                  {repo.default_branch}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function languageColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: "bg-blue-400",
    JavaScript: "bg-yellow-400",
    Python: "bg-green-400",
    Go: "bg-cyan-400",
    Rust: "bg-orange-400",
    Java: "bg-red-400",
    Ruby: "bg-red-500",
    PHP: "bg-violet-400",
    "C#": "bg-green-500",
    "C++": "bg-pink-400",
    C: "bg-zinc-400",
    Shell: "bg-emerald-400",
    Dockerfile: "bg-blue-500",
    HCL: "bg-purple-400",
  };
  return colors[lang] || "bg-zinc-500";
}
