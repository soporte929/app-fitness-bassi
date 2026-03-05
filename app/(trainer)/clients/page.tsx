"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { Search, Plus, ArrowRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const clients = [
  { id: 1, name: "Carlos Martínez", phase: "Déficit", status: "green" as const, adherence: 94, lastWorkout: "Hace 1 día", weightKg: 82.4, alert: null },
  { id: 2, name: "Ana López", phase: "Mantenimiento", status: "yellow" as const, adherence: 68, lastWorkout: "Hace 3 días", weightKg: 61.2, alert: "Adherencia baja" },
  { id: 3, name: "Marcos Ruiz", phase: "Superávit", status: "red" as const, adherence: 41, lastWorkout: "Hace 5 días", weightKg: 74.8, alert: "Sin entrenar 5 días" },
  { id: 4, name: "Laura Sánchez", phase: "Déficit", status: "green" as const, adherence: 88, lastWorkout: "Hace 1 día", weightKg: 67.0, alert: null },
  { id: 5, name: "Pablo García", phase: "Superávit", status: "green" as const, adherence: 91, lastWorkout: "Ayer", weightKg: 78.3, alert: null },
  { id: 6, name: "Sofía Torres", phase: "Mantenimiento", status: "yellow" as const, adherence: 72, lastWorkout: "Hace 2 días", weightKg: 58.5, alert: "Peso estancado" },
  { id: 7, name: "Diego Herrera", phase: "Déficit", status: "green" as const, adherence: 85, lastWorkout: "Ayer", weightKg: 91.1, alert: null },
  { id: 8, name: "Marta Jiménez", phase: "Déficit", status: "red" as const, adherence: 38, lastWorkout: "Hace 7 días", weightKg: 70.2, alert: "Sin contacto 1 semana" },
];

type StatusFilter = "all" | "green" | "yellow" | "red";

const statusLabels: Record<StatusFilter, string> = {
  all: "Todos",
  green: "Correcto",
  yellow: "Revisar",
  red: "Intervención",
};

export default function ClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: clients.length,
    green: clients.filter((c) => c.status === "green").length,
    yellow: clients.filter((c) => c.status === "yellow").length,
    red: clients.filter((c) => c.status === "red").length,
  };

  const statusDotColor: Record<StatusFilter, string> = {
    all: "#0071e3",
    green: "#30d158",
    yellow: "#ffd60a",
    red: "#ff375f",
  };

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[#1d1d1f] tracking-tight">Clientes</h1>
            <p className="text-[#6e6e73] text-sm mt-0.5">{clients.length} clientes activos</p>
          </div>
          <Button size="md">
            <Plus className="w-4 h-4" /> Nuevo cliente
          </Button>
        </div>

        {/* Filtros de estado */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(statusLabels) as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border",
                statusFilter === s
                  ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                  : "bg-white text-[#6e6e73] border-[#e5e5ea] hover:border-[#aeaeb2]"
              )}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusFilter === s ? "white" : statusDotColor[s] }}
              />
              {statusLabels[s]}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full ml-0.5",
                statusFilter === s ? "bg-white/20 text-white" : "bg-[#f2f2f4] text-[#aeaeb2]"
              )}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e5ea] rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73]"
            >
              ×
            </button>
          )}
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#aeaeb2]">
            <SlidersHorizontal className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay clientes con ese filtro</p>
          </div>
        ) : (
          <div className="space-y-2 stagger">
            {filtered.map((client, i) => (
              <Card
                key={client.id}
                className="card-hover cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#f2f2f4] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-[#1d1d1f]">{client.name[0]}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1d1d1f]">{client.name}</span>
                        <StatusBadge
                          status={client.status}
                          label={client.status === "green" ? "Correcto" : client.status === "yellow" ? "Revisar" : "Intervención"}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#6e6e73]">{client.phase}</span>
                        <span className="text-xs text-[#aeaeb2]">·</span>
                        <span className="text-xs text-[#6e6e73]">{client.lastWorkout}</span>
                        {client.alert && (
                          <>
                            <span className="text-xs text-[#aeaeb2]">·</span>
                            <span className="text-xs text-[#ff375f]">{client.alert}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Adherencia + flecha */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className={cn(
                          "text-sm font-semibold",
                          client.adherence >= 80 ? "text-[#30d158]" : client.adherence >= 60 ? "text-[#ffd60a]" : "text-[#ff375f]"
                        )}>
                          {client.adherence}%
                        </p>
                        <p className="text-[10px] text-[#aeaeb2]">adherencia</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#aeaeb2]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
