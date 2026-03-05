"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Bell,
  Ruler,
  Shield,
  ChevronRight,
  LogOut,
  Flame,
  Trophy,
} from "lucide-react";

const client = {
  name: "Carlos Martínez",
  email: "carlos@gmail.com",
  phase: "Déficit",
  joinedDate: "Enero 2026",
  adherence: 94,
  streak: 12,
  totalWorkouts: 38,
};

const settingsSections = [
  {
    title: "Cuenta",
    items: [
      { label: "Datos personales", icon: User, href: "#" },
      { label: "Notificaciones", icon: Bell, href: "#" },
      { label: "Unidades de medida", icon: Ruler, href: "#" },
    ],
  },
  {
    title: "App",
    items: [
      { label: "Privacidad", icon: Shield, href: "#" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mb-6">
          Perfil
        </h1>

        {/* User card */}
        <Card className="mb-5">
          <CardContent className="py-5 px-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#0071e3] text-xl font-bold">{client.name[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-[#1d1d1f] truncate">{client.name}</p>
                <p className="text-sm text-[#6e6e73] truncate">{client.email}</p>
                <p className="text-xs text-[#aeaeb2] mt-0.5">
                  {client.phase} · Desde {client.joinedDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Card>
            <CardContent className="py-3 px-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-[#ff9f0a]" />
              </div>
              <p className="text-lg font-bold text-[#1d1d1f]">{client.streak}</p>
              <p className="text-[10px] text-[#aeaeb2] font-medium">días racha</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-3.5 h-3.5 text-[#0071e3]" />
              </div>
              <p className="text-lg font-bold text-[#1d1d1f]">{client.totalWorkouts}</p>
              <p className="text-[10px] text-[#aeaeb2] font-medium">entrenos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-3 text-center">
              <div className="mb-1 h-3.5" />
              <p className="text-lg font-bold text-[#30d158]">{client.adherence}%</p>
              <p className="text-[10px] text-[#aeaeb2] font-medium">adherencia</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        {settingsSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="text-xs font-semibold text-[#aeaeb2] uppercase tracking-wider px-1 mb-2">
              {section.title}
            </p>
            <Card>
              <CardContent className="p-0">
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#f5f5f7] transition-colors text-left ${
                        i < section.items.length - 1 ? "border-b border-[#e5e5ea]" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#f2f2f4] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#6e6e73]" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[#1d1d1f]">
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#aeaeb2]" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Logout */}
        <Card className="mt-2">
          <CardContent className="p-0">
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#fff0f3] transition-colors rounded-[inherit] text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#ff375f]/10 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-4 h-4 text-[#ff375f]" />
              </div>
              <span className="flex-1 text-sm font-medium text-[#ff375f]">
                Cerrar sesión
              </span>
            </button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#d2d2d7] mt-6">
          Fitness Bassi v1.0
        </p>
      </div>
    </PageTransition>
  );
}
