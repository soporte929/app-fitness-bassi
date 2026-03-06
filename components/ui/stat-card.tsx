import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  sub,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-[var(--success)]"
      : trend === "down"
        ? "text-[var(--danger)]"
        : "text-[var(--text-muted)]";

  return (
    <div
      className={cn(
        "bg-[var(--bg-surface)] rounded-lg border border-[var(--border)] px-5 py-4",
        className
      )}
    >
      <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight font-[family-name:var(--font-mono)]">
          {value}
        </span>
        {unit && <span className="text-sm text-[var(--text-secondary)]">{unit}</span>}
      </div>
      {(sub || trendValue) && (
        <p className={cn("text-xs mt-1", trendValue ? trendColor : "text-[var(--text-muted)]")}>
          {trendValue ?? sub}
        </p>
      )}
    </div>
  );
}
