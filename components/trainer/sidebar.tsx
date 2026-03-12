"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  Layers,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";

const navigation = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Clientes", href: "/clients", icon: Users },
      { label: "Ajustes", href: "/settings", icon: Settings },
    ],
  },
  {
    section: "Herramientas",
    items: [
      { label: "Rutinas", href: "/routines-templates", icon: ClipboardList },
      { label: "Planes", href: "/plans", icon: Layers },
      { label: "Ejercicios", href: "/exercises", icon: Dumbbell },
    ],
  },
];

interface TrainerSidebarProps {
  collapsed: boolean;
  isMobile: boolean;
  isMounted: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpen: () => void;
}

export function TrainerSidebar({
  collapsed,
  isMobile,
  isMounted,
  onToggle,
  onClose,
  onOpen,
}: TrainerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  // In mobile: sidebar is overlay with translate. In desktop: static.
  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col h-screen overflow-hidden",
    // Mobile: overlay with transform
    isMobile
      ? cn(
        "w-64 transition-transform duration-300 ease-in-out shadow-2xl shadow-black/20",
        collapsed ? "translate-x-[-100%]" : "translate-x-0"
      )
      : "w-64 transition-none translate-x-0"
  );

  // On mobile when expanded, show dark backdrop
  const showBackdrop = isMobile && !collapsed;

  return (
    <>
      {/* Backdrop — only on mobile when sidebar is open */}
      {showBackdrop && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo + toggle */}
        <div
          className={cn(
            "py-5 border-b border-[var(--border)] flex items-center gap-2",
            isMobile ? (collapsed ? "px-3 justify-center" : "px-4 justify-between") : "px-4 justify-between" // Desktop always expanded
          )}
        >
          <div className={cn("flex items-center gap-3 min-w-0", isMobile && collapsed && "justify-center")}>
            {(!isMobile || !collapsed) ? (
              <div className="flex flex-col items-center w-full">
                <Image
                  src="/2.png"
                  alt="Fitness Bassi"
                  width={120}
                  height={40}
                  className="object-contain"
                  priority
                />
                <span className="font-anton text-[#F5C518] text-xl tracking-wide mt-1 text-center w-full">
                  FITNESS BASSI
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-[var(--text-primary)] rounded-lg flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-4 h-4 text-[var(--bg-base)]" strokeWidth={2.5} />
              </div>
            )}
          </div>
          {/* Close button (only mobile) */}
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Cerrar menú"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5 flex flex-col justify-start">
          {navigation.map((group) => (
            <div key={group.section}>
              {(isMobile || !collapsed) && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {group.section}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  const isIconOnly = collapsed && !isMobile;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={isIconOnly ? item.label : undefined}
                        onClick={() => {
                          if (isMobile) onClose();
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg text-sm transition-all duration-150",
                          isIconOnly ? "justify-center px-2 py-2.5" : "px-3 py-2",
                          active
                            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                        {!isIconOnly && item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className={cn("px-2 py-2 border-t border-[var(--border)]", collapsed && !isMobile ? "flex justify-center" : "px-3")}>
          <ThemeToggle />
        </div>

        {/* User */}
        <div className="px-2 py-3 border-t border-[var(--border)]">
          <div
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer group transition-colors",
              collapsed && !isMobile ? "justify-center px-2 py-2.5" : "px-3 py-2"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--accent-text)] text-xs font-semibold">B</span>
            </div>
            {(isMobile || !collapsed) && (
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
