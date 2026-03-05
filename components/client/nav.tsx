"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, Apple, TrendingUp, Video, UserCircle } from "lucide-react";

const tabs = [
  { label: "Hoy", href: "/today", icon: Dumbbell },
  { label: "Nutrición", href: "/nutrition", icon: Apple },
  { label: "Progreso", href: "/progress", icon: TrendingUp },
  { label: "Auditoría", href: "/audit", icon: Video },
  { label: "Perfil", href: "/profile", icon: UserCircle },
];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/90 backdrop-blur-xl border-t border-[#e5e5ea] px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active ? "text-[#0071e3]" : "text-[#aeaeb2]"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-[#0071e3]" : "text-[#aeaeb2]"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
