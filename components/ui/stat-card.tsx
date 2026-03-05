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
      ? "text-[#30d158]"
      : trend === "down"
      ? "text-[#ff375f]"
      : "text-[#aeaeb2]";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#e5e5ea] px-5 py-4",
        className
      )}
    >
      <p className="text-xs font-medium text-[#6e6e73] mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm text-[#6e6e73]">{unit}</span>}
      </div>
      {(sub || trendValue) && (
        <p className={cn("text-xs mt-1", trendValue ? trendColor : "text-[#aeaeb2]")}>
          {trendValue ?? sub}
        </p>
      )}
    </div>
  );
}
