import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "text-red-400 bg-red-500/10 border-red-500/30";
    case "warning":
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "suggestion":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    case "good":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    default:
      return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-emerald-400 bg-emerald-500/10";
    case "scanning":
    case "cloning":
      return "text-blue-400 bg-blue-500/10";
    case "queued":
      return "text-zinc-400 bg-zinc-500/10";
    case "failed":
      return "text-red-400 bg-red-500/10";
    default:
      return "text-zinc-400 bg-zinc-500/10";
  }
}
