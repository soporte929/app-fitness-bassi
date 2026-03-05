"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { MiniChart } from "@/components/ui/mini-chart";
import { AlertBanner } from "@/components/ui/alert-banner";
import { calculateNutrition } from "@/lib/calculations/nutrition";
import { computeAlerts } from "@/lib/alerts";
import { PageTransition } from "@/components/ui/page-transition";
import {
  ArrowLeft,
  Flame,
  Video,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const client = {
  id: 1,
  name: "Carlos Martínez",
  phase: "Déficit",
  status: "green" as const,
  weightKg: 82.4,
  bodyFatPct: 18,
  activityLevel: "moderate" as const,
  dailySteps: 8500,
  goal: "deficit" as const,
  adherence: 94,
  joinedDate: "Enero 2026",
};

const weightHistory = [
  { date: "20 ene", value: 85.2 },
  { date: "27 ene", value: 84.6 },
  { date: "3 feb", value: 84.0 },
  { date: "10 feb", value: 83.4 },
  { date: "17 feb", value: 83.1 },
  { date: "24 feb", value: 82.8 },
  { date: "3 mar", value: 82.4 },
];

const waistHistory = [
  { date: "20 ene", value: 92 },
  { date: "27 ene", value: 91 },
  { date: "3 feb", value: 90 },
  { date: "10 feb", value: 89 },
  { date: "17 feb", value: 89 },
  { date: "24 feb", value: 88 },
  { date: "3 mar", value: 88 },
];

const recentWorkouts = [
  { date: "3 mar", day: "Día A", exercises: 6, completed: true },
  { date: "1 mar", day: "Día B", exercises: 5, completed: true },
  { date: "27 feb", day: "Día C", exercises: 6, completed: true },
  { date: "25 feb", day: "Día A", exercises: 6, completed: false },
];

const clientAlertInput = {
  adherencePct: client.adherence,
  daysSinceLastWorkout: 1,
  weightDeltaKg: -0.4,
  waistDeltaCm: -0.5,
  phase: "deficit" as const,
  weeklyWorkoutsCompleted: 3,
  weeklyWorkoutsTarget: 4,
};

export default function ClientDetailPage() {
  const nutrition = calculateNutrition({
    weightKg: client.weightKg,
    bodyFatPct: client.bodyFatPct,
    activityLevel: client.activityLevel,
    dailySteps: client.dailySteps,
    goal: client.goal,
  });

  const weightDelta = weightHistory[weightHistory.length - 1].value - weightHistory[0].value;
  const waistDelta = waistHistory[waistHistory.length - 1].value - waistHistory[0].value;
  const alerts = computeAlerts(clientAlertInput);

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 w-full max-w-full">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="w-9 h-9 rounded-xl bg-white border border-[#e5e5ea] flex items-center justify-center hover:bg-[#f5f5f7] transition-colors flex-shrink-0">
                <ArrowLeft className="w-4 h-4 text-[#6e6e73]" />
              </button>
            </Link>
            <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[#0071e3] font-bold">{client.name[0]}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                  {client.name}
                </h1>
                <StatusBadge
                  status={client.status}
                  label={
                    client.status === "green" ? "Correcto"
                    : client.status === "yellow" ? "Revisar"
                    : "Intervención"
                  }
                />
              </div>
              <p className="text-[#6e6e73] text-sm">{client.phase} · Desde {client.joinedDate}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm">
              <Video className="w-4 h-4" /> Auditoría
            </Button>
            <Button size="sm">Editar plan</Button>
          </div>
        </div>

        {/* Alertas del motor */}
        {alerts.length > 0 && (
          <div className="space-y-2 mb-5">
            {alerts.map((alert) => (
              <AlertBanner key={alert.id} alert={alert} />
            ))}
          </div>
        )}
        {alerts.length === 0 && (
          <div className="flex items-center gap-3 bg-[#30d158]/8 border border-[#30d158]/20 rounded-xl px-4 py-3 mb-5">
            <span className="text-sm text-[#248a3d] font-medium">Todo en orden — el cliente progresa bien</span>
          </div>
        )}

        {/* Layout principal: apila en md, 3 cols en xl */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Columna principal (izquierda) */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Stats — 2 cols en sm, 4 en lg */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Peso actual" value={client.weightKg} unit="kg" trend="down" trendValue={`${weightDelta.toFixed(1)} kg`} />
              <StatCard label="% Grasa" value={client.bodyFatPct} unit="%" sub="estimado" />
              <StatCard label="Masa libre grasa" value={nutrition.ffm} unit="kg" sub="FFM" />
              <StatCard label="Adherencia" value={`${client.adherence}%`} trend="up" trendValue="Esta semana" />
            </div>

            {/* Gráficas — 1 col en sm, 2 en md */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f]">Peso</p>
                      <p className="text-xs text-[#6e6e73] mt-0.5">Últimas 6 semanas</p>
                    </div>
                    <span className="text-xs font-medium text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full">
                      {weightDelta.toFixed(1)} kg
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <MiniChart data={weightHistory} color="#0071e3" unit=" kg" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f]">Cintura</p>
                      <p className="text-xs text-[#6e6e73] mt-0.5">Últimas 6 semanas</p>
                    </div>
                    <span className="text-xs font-medium text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full">
                      {waistDelta} cm
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <MiniChart data={waistHistory} color="#ff9f0a" unit=" cm" />
                </CardContent>
              </Card>
            </div>

            {/* Últimos entrenamientos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1d1d1f]">Últimos entrenamientos</p>
                  <Button variant="ghost" size="sm">
                    Ver historial <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentWorkouts.map((w, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-5 py-3.5 ${
                      i < recentWorkouts.length - 1 ? "border-b border-[#e5e5ea]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.completed ? "bg-[#30d158]" : "bg-[#ff375f]"}`} />
                      <div>
                        <p className="text-sm font-medium text-[#1d1d1f]">{w.day}</p>
                        <p className="text-xs text-[#6e6e73]">{w.exercises} ejercicios</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#aeaeb2]">{w.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral — nutrición (fija en xl, full en md) */}
          <div className="xl:w-72 space-y-4 flex-shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#ff9f0a]" />
                  <p className="text-sm font-semibold text-[#1d1d1f]">Plan nutricional</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-1">
                  <p className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
                    {nutrition.targetCalories}
                  </p>
                  <p className="text-xs text-[#6e6e73] mt-1">kcal objetivo</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: "Proteína", g: nutrition.macros.protein.g, pct: nutrition.macros.protein.pct, color: "#0071e3" },
                    { label: "Carbohidratos", g: nutrition.macros.carbs.g, pct: nutrition.macros.carbs.pct, color: "#30d158" },
                    { label: "Grasa", g: nutrition.macros.fat.g, pct: nutrition.macros.fat.pct, color: "#ff9f0a" },
                  ].map((macro) => (
                    <div key={macro.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[#6e6e73]">{macro.label}</span>
                        <span className="text-xs font-medium text-[#1d1d1f]">{macro.g}g</span>
                      </div>
                      <div className="h-1.5 bg-[#f2f2f4] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${macro.pct}%`, backgroundColor: macro.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#e5e5ea] pt-3 space-y-1.5">
                  {[
                    { label: "TMB (Cunningham)", value: `${nutrition.tmb_cunningham} kcal` },
                    { label: "TMB (Tinsley)", value: `${nutrition.tmb_tinsley} kcal` },
                    { label: "GET total", value: `${nutrition.get} kcal` },
                    { label: "Bonus pasos", value: `+${nutrition.stepsBonus} kcal`, green: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-xs text-[#6e6e73]">{row.label}</span>
                      <span className={`text-xs font-medium ${row.green ? "text-[#30d158]" : "text-[#1d1d1f]"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-[#6e6e73] mb-2 font-medium">Fase actual</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#1d1d1f]">{client.phase}</span>
                  <span className="text-xs text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-full">
                    Semana 6
                  </span>
                </div>
                <div className="h-1.5 bg-[#f2f2f4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0071e3] rounded-full" style={{ width: "60%" }} />
                </div>
                <p className="text-xs text-[#aeaeb2] mt-1.5">6 de 10 semanas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
