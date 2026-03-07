import { Alert, AlertLevel } from "@/lib/alerts";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const config: Record<AlertLevel, { Icon: typeof AlertTriangle; bg: string; border: string; text: string }> = {
  critical: { Icon: AlertCircle, bg: "bg-[var(--danger)]/8", border: "border-[var(--danger)]/20", text: "text-[var(--danger)]" },
  warning: { Icon: AlertTriangle, bg: "bg-[var(--warning)]/8", border: "border-[var(--warning)]/20", text: "text-[var(--warning)]" },
  info: { Icon: Info, bg: "bg-[var(--accent)]/8", border: "border-[var(--accent)]/20", text: "text-[var(--accent)]" },
};

export function AlertBanner({ alert }: { alert: Alert }) {
  const { Icon, bg, border, text } = config[alert.level];
  return (
    <div className={`flex items-start gap-3 ${bg} border ${border} rounded-lg px-4 py-3`}>
      <Icon className={`w-4 h-4 ${text} flex-shrink-0 mt-0.5`} />
      <div className="min-w-0">
        <p className={`text-sm font-medium md:whitespace-normal truncate block ${text}`}>{alert.message}</p>
        {alert.action && (
          <p className={`text-xs mt-0.5 opacity-70 ${text}`}>{alert.action}</p>
        )}
      </div>
    </div>
  );
}
