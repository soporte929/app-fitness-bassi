import { Alert, AlertLevel } from "@/lib/alerts";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const config: Record<AlertLevel, { Icon: typeof AlertTriangle; bg: string; border: string; text: string }> = {
  critical: { Icon: AlertCircle,   bg: "bg-red-500/8",    border: "border-red-500/20",    text: "text-red-600 dark:text-red-400" },
  warning:  { Icon: AlertTriangle, bg: "bg-yellow-500/8", border: "border-yellow-500/20", text: "text-yellow-600 dark:text-yellow-400" },
  info:     { Icon: Info,          bg: "bg-blue-500/8",   border: "border-blue-500/20",   text: "text-blue-600 dark:text-blue-400" },
};

export function AlertBanner({ alert }: { alert: Alert }) {
  const { Icon, bg, border, text } = config[alert.level];
  return (
    <div className={`flex items-start gap-3 ${bg} border ${border} rounded-lg px-4 py-3`}>
      <Icon className={`w-4 h-4 ${text} flex-shrink-0 mt-0.5`} />
      <div className="min-w-0">
        <p className={`text-sm font-medium ${text}`}>{alert.message}</p>
        {alert.action && (
          <p className={`text-xs mt-0.5 opacity-70 ${text}`}>{alert.action}</p>
        )}
      </div>
    </div>
  );
}
