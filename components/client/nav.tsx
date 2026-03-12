"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, History, TrendingUp, ClipboardList, UserCircle } from "lucide-react";

const tabs = [
  { label: "Hoy", href: "/today", icon: Dumbbell },
  { label: "Historial", href: "/history", icon: History },
  { label: "Rutinas", href: "/routines", icon: ClipboardList },
  { label: "Progreso", href: "/progress", icon: TrendingUp },
  { label: "Perfil", href: "/profile", icon: UserCircle },
];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border)] px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                )}
              >
                {tab.label}
              </span>
              {active && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
