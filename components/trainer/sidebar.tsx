"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Dumbbell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navigation = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Clientes", href: "/clients", icon: Users },
    ],
  },
  {
    section: "Herramientas",
    items: [
      { label: "Ejercicios", href: "/exercises", icon: Dumbbell },
      { label: "Informes", href: "/reports", icon: FileText },
    ],
  },
  {
    section: "Sistema",
    items: [{ label: "Ajustes", href: "/settings", icon: Settings }],
  },
];

export function TrainerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col h-screen transition-all duration-300 overflow-hidden shadow-2xl shadow-black/20",
          collapsed ? "w-[64px]" : "w-60"
        )}
      >
        {/* Logo + toggle */}
        <div
          className={cn(
            "py-5 border-b border-[var(--border)] flex items-center gap-2",
            collapsed ? "px-3 justify-center" : "px-4 justify-between"
          )}
        >
          <div className={cn("flex items-center gap-3 min-w-0", collapsed && "justify-center")}>
            <div className="w-8 h-8 bg-[var(--text-primary)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-4 h-4 text-[var(--bg-base)]" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[var(--text-primary)] text-sm font-semibold leading-tight truncate tracking-wide">
                  Fitness Bassi
                </p>
                <p className="text-[var(--text-muted)] text-xs">Entrenador</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors flex-shrink-0"
              title="Colapsar menú"
            >
              <PanelLeftClose className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center px-3 py-3 border-b border-[var(--border)]">
            <button
              onClick={() => setCollapsed(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
              title="Expandir menú"
            >
              <PanelLeftOpen className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
          {navigation.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {group.section}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg text-sm transition-all duration-150",
                          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                          active
                            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                        {!collapsed && item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className={cn("px-2 py-2 border-t border-[var(--border)]", collapsed ? "flex justify-center" : "px-3")}>
          <ThemeToggle />
        </div>

        {/* User */}
        <div className="px-2 py-3 border-t border-[var(--border)]">
          <div
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer group transition-colors",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--accent-text)] text-xs font-semibold">B</span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-primary)] text-sm font-medium truncate">Bassi</p>
                  <p className="text-[var(--text-muted)] text-xs">Entrenador</p>
                </div>
                <LogOut className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
