import { cn } from "@/lib/utils";

interface BadgeProps {
  status: "green" | "yellow" | "red";
  label: string;
  className?: string;
}

const config = {
  green: {
    dot: "bg-[#30d158]",
    bg: "bg-[#30d158]/10",
    text: "text-[#248a3d]",
    label: "Correcto",
  },
  yellow: {
    dot: "bg-[#ffd60a]",
    bg: "bg-[#ffd60a]/10",
    text: "text-[#9d8000]",
    label: "Revisar",
  },
  red: {
    dot: "bg-[#ff375f]",
    bg: "bg-[#ff375f]/10",
    text: "text-[#c0001a]",
    label: "Intervención",
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
