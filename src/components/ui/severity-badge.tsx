import { cn } from "@/lib/utils";
import { severityColor } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: string;
  count?: number;
  className?: string;
}

export function SeverityBadge({ severity, count, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wider border",
        severityColor(severity),
        className
      )}
    >
      {severity}
      {count !== undefined && (
        <span className="opacity-70">{count}</span>
      )}
    </span>
  );
}
