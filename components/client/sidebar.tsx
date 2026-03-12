"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, TrendingUp, Video } from "lucide-react";

const tabs = [
  { label: "Hoy", href: "/today", icon: Dumbbell },
  { label: "Progreso", href: "/progress", icon: TrendingUp },
  { label: "Auditoría", href: "/audit", icon: Video },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-[var(--bg-surface)] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-[var(--accent-text)]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[var(--text-primary)] text-sm font-semibold leading-tight">Fitness Bassi</p>
            <p className="text-[var(--text-muted)] text-xs">Mi espacio</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-[var(--bg-overlay)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--text-primary)] text-xs font-semibold">C</span>
          </div>
          <div className="min-w-0">
            <p className="text-[var(--text-primary)] text-sm font-medium truncate">Carlos M.</p>
            <p className="text-[var(--text-muted)] text-xs">Cliente</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
