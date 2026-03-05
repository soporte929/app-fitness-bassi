import { cn } from "@/lib/utils";

interface BadgeProps {
  status: "green" | "yellow" | "red";
  label: string;
  className?: string;
}

const config = {
  green: {
    dot: "bg-green-500",
    bg: "bg-green-500/10 border border-green-500/20",
    text: "text-green-600 dark:text-green-400",
  },
  yellow: {
    dot: "bg-yellow-500",
    bg: "bg-yellow-500/10 border border-yellow-500/20",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  red: {
    dot: "bg-red-500",
    bg: "bg-red-500/10 border border-red-500/20",
    text: "text-red-600 dark:text-red-400",
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
