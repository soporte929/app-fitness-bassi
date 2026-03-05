"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { PageTransition } from "@/components/ui/page-transition";
import { computeAlerts } from "@/lib/alerts";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Video,
  Plus,
  ArrowRight,
} from "lucide-react";

const clients = [
  {
    id: 1,
    name: "Carlos Martínez",
    phase: "Déficit",
    status: "green" as const,
    lastWorkout: "Hace 1 día",
    adherence: 94,
    alertInput: { adherencePct: 94, daysSinceLastWorkout: 1, weightDeltaKg: -0.4, waistDeltaCm: -0.5, phase: "deficit" as const, weeklyWorkoutsCompleted: 3, weeklyWorkoutsTarget: 4 },
  },
  {
    id: 2,
    name: "Ana López",
    phase: "Mantenimiento",
    status: "yellow" as const,
    lastWorkout: "Hace 3 días",
    adherence: 68,
    alertInput: { adherencePct: 68, daysSinceLastWorkout: 3, weightDeltaKg: 0.0, waistDeltaCm: 0.2, phase: "maintenance" as const, weeklyWorkoutsCompleted: 1, weeklyWorkoutsTarget: 3 },
  },
  {
    id: 3,
    name: "Marcos Ruiz",
    phase: "Superávit",
    status: "red" as const,
    lastWorkout: "Hace 5 días",
    adherence: 41,
    alertInput: { adherencePct: 41, daysSinceLastWorkout: 5, weightDeltaKg: 0.3, waistDeltaCm: 1.5, phase: "surplus" as const, weeklyWorkoutsCompleted: 0, weeklyWorkoutsTarget: 4 },
  },
];

// Calcular alertas activas del motor
const allAlerts = clients.flatMap((c) => computeAlerts(c.alertInput));
const criticalCount = allAlerts.filter((a) => a.level === "critical").length;
const goodCount = clients.filter((c) => c.status === "green").length;

const stats = [
  { label: "Clientes activos", value: "8", icon: Users, color: "#0071e3" },
  { label: "Alertas activas", value: String(criticalCount), icon: AlertTriangle, color: "#ff375f" },
  { label: "Auditorías pendientes", value: "2", icon: Video, color: "#ff9f0a" },
  { label: "Progresando bien", value: String(goodCount), icon: TrendingUp, color: "#30d158" },
];

export default function TrainerDashboard() {
  const router = useRouter();
  return (
    <PageTransition>
      <div className="p-5 lg:p-8 w-full max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[#1d1d1f] tracking-tight">
              Dashboard
            </h1>
            <p className="text-[#6e6e73] text-sm mt-0.5">
              Miércoles, 4 de marzo de 2026
            </p>
          </div>
          <Button size="md">
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </Button>
        </div>

        {/* Stats grid — 2 cols en medio, 4 en grande */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="card-hover animate-fade-in">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[#6e6e73] text-xs font-medium mb-1 truncate">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-[#1d1d1f]">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alertas activas */}
        {allAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h2 className="text-sm font-semibold text-[#1d1d1f] mb-3">Alertas activas</h2>
            {clients.flatMap((c) =>
              computeAlerts(c.alertInput).map((alert) => (
                <div
                  key={`${c.id}-${alert.id}`}
                  className="cursor-pointer"
                  onClick={() => router.push(`/clients/${c.id}`)}
                >
                  <AlertBanner alert={{ ...alert, message: `${c.name} — ${alert.message}` }} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Clients table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1d1d1f]">Clientes</h2>
                <p className="text-sm text-[#6e6e73] mt-0.5">Estado en tiempo real</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#e5e5ea]">
                  {["Cliente", "Fase", "Estado", "Último entreno", "Adherencia", "Alerta", ""].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left px-5 py-3 text-xs font-medium text-[#aeaeb2] uppercase tracking-wide whitespace-nowrap"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {clients.map((client, i) => (
                    <tr
                      key={client.id}
                      onClick={() => router.push(`/clients/${client.id}`)}
                      className={`hover:bg-[#f5f5f7] cursor-pointer animate-fade-in ${
                        i < clients.length - 1 ? "border-b border-[#e5e5ea]" : ""
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f2f2f4] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-[#1d1d1f]">
                              {client.name[0]}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[#1d1d1f]">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6e6e73]">{client.phase}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={client.status}
                          label={
                            client.status === "green"
                              ? "Correcto"
                              : client.status === "yellow"
                              ? "Revisar"
                              : "Intervención"
                          }
                        />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6e6e73]">{client.lastWorkout}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#f2f2f4] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${client.adherence}%`,
                                backgroundColor:
                                  client.adherence >= 80
                                    ? "#30d158"
                                    : client.adherence >= 60
                                    ? "#ffd60a"
                                    : "#ff375f",
                              }}
                            />
                          </div>
                          <span className="text-sm text-[#6e6e73]">{client.adherence}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        {client.alert ? (
                          <span className="text-xs text-[#ff375f] line-clamp-1">{client.alert}</span>
                        ) : (
                          <span className="text-xs text-[#aeaeb2]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <ArrowRight className="w-4 h-4 text-[#aeaeb2]" />
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
