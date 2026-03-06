import { cn } from "@/lib/utils";

interface BadgeProps {
  status: "green" | "yellow" | "red";
  label: string;
  className?: string;
}

const config = {
  green: {
    dot: "bg-[var(--success)]",
    bg: "bg-[var(--success)]/10 border border-[var(--success)]/20",
    text: "text-[var(--success)]",
  },
  yellow: {
    dot: "bg-[var(--warning)]",
    bg: "bg-[var(--warning)]/10 border border-[var(--warning)]/20",
    text: "text-[var(--warning)]",
  },
  red: {
    dot: "bg-[var(--danger)]",
    bg: "bg-[var(--danger)]/10 border border-[var(--danger)]/20",
    text: "text-[var(--danger)]",
  },
};

export function StatusBadge({ status, label, className }: BadgeProps) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        c.bg,
        c.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
      {label}
    </span>
  );
}
