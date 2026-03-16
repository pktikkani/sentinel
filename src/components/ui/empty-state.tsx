import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-zinc-200 dark:border-sentinel-700/40 bg-zinc-50 dark:bg-sentinel-900/40 mb-4">
        <Icon className="w-5 h-5 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
      <p className="mt-1 text-[13px] text-zinc-400 dark:text-zinc-600 max-w-xs">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
