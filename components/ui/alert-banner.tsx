import { Alert, AlertLevel } from "@/lib/alerts";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const config: Record<AlertLevel, { Icon: typeof AlertTriangle; bg: string; border: string; text: string }> = {
  critical: { Icon: AlertCircle,   bg: "bg-[#ff375f]/8",  border: "border-[#ff375f]/20", text: "text-[#cc0022]" },
  warning:  { Icon: AlertTriangle, bg: "bg-[#ff9f0a]/8",  border: "border-[#ff9f0a]/20", text: "text-[#b36200]" },
  info:     { Icon: Info,          bg: "bg-[#0071e3]/8",  border: "border-[#0071e3]/20", text: "text-[#0071e3]" },
};

export function AlertBanner({ alert }: { alert: Alert }) {
  const { Icon, bg, border, text } = config[alert.level];
  return (
    <div className={`flex items-start gap-3 ${bg} border ${border} rounded-xl px-4 py-3`}>
      <Icon className={`w-4 h-4 ${text} flex-shrink-0 mt-0.5`} />
      <div className="min-w-0">
        <p className={`text-sm font-medium ${text}`}>{alert.message}</p>
        {alert.action && (
          <p className={`text-xs mt-0.5 opacity-80 ${text}`}>{alert.action}</p>
        )}
      </div>
    </div>
  );
}
