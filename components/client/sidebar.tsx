"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, Apple, TrendingUp, Video } from "lucide-react";

const tabs = [
  { label: "Hoy", href: "/today", icon: Dumbbell },
  { label: "Nutrición", href: "/nutrition", icon: Apple },
  { label: "Progreso", href: "/progress", icon: TrendingUp },
  { label: "Auditoría", href: "/audit", icon: Video },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-[#1c1c1e] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0071e3] rounded-lg flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Fitness Bassi</p>
            <p className="text-[#8e8e93] text-xs">Mi espacio</p>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-[#aeaeb2] hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#636366] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">C</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">Carlos M.</p>
            <p className="text-[#636366] text-xs">Cliente</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
