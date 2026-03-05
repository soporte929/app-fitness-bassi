"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MiniChart } from "@/components/ui/mini-chart";
import { PageTransition } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

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

const hipHistory = [
  { date: "20 ene", value: 104 },
  { date: "27 ene", value: 103 },
  { date: "3 feb", value: 103 },
  { date: "10 feb", value: 102 },
  { date: "17 feb", value: 102 },
  { date: "24 feb", value: 101 },
  { date: "3 mar", value: 101 },
];

const bodyFatHistory = [
  { date: "20 ene", value: 20.1 },
  { date: "27 ene", value: 19.8 },
  { date: "3 feb", value: 19.4 },
  { date: "10 feb", value: 19.0 },
  { date: "17 feb", value: 18.8 },
  { date: "24 feb", value: 18.4 },
  { date: "3 mar", value: 18.0 },
];

const PERIODS = ["4 sem", "8 sem", "3 m", "Todo"] as const;
type Period = (typeof PERIODS)[number];

function delta(data: { value: number }[]) {
  return data[data.length - 1].value - data[0].value;
}

function DeltaBadge({ value, unit, lowerIsBetter = true }: { value: number; unit: string; lowerIsBetter?: boolean }) {
  const good = lowerIsBetter ? value < 0 : value > 0;
  const neutral = value === 0;

  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
        neutral
          ? "bg-[#f2f2f4] text-[#6e6e73]"
          : good
          ? "bg-[#30d158]/10 text-[#248a3d]"
          : "bg-[#ff375f]/10 text-[#ff375f]"
      )}
    >
      {neutral ? (
        <Minus className="w-3 h-3" />
      ) : good ? (
        <TrendingDown className="w-3 h-3" />
      ) : (
        <TrendingUp className="w-3 h-3" />
      )}
      {value > 0 ? "+" : ""}
      {value.toFixed(1)} {unit}
    </span>
  );
}

export default function ProgressPage() {
  const [period, setPeriod] = useState<Period>("8 sem");

  const wDelta = delta(weightHistory);
  const waDelta = delta(waistHistory);
  const hDelta = delta(hipHistory);
  const bfDelta = delta(bodyFatHistory);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Progreso</h1>
          {/* Period selector */}
          <div className="flex bg-[#f2f2f4] rounded-xl p-0.5 gap-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all",
                  period === p
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : "text-[#6e6e73]"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-5 stagger">
          {[
            { label: "Peso", value: `${weightHistory[weightHistory.length - 1].value}`, unit: "kg", delta: wDelta, lowerIsBetter: true },
            { label: "% Grasa", value: `${bodyFatHistory[bodyFatHistory.length - 1].value}`, unit: "%", delta: bfDelta, lowerIsBetter: true },
            { label: "Cintura", value: `${waistHistory[waistHistory.length - 1].value}`, unit: "cm", delta: waDelta, lowerIsBetter: true },
            { label: "Cadera", value: `${hipHistory[hipHistory.length - 1].value}`, unit: "cm", delta: hDelta, lowerIsBetter: true },
          ].map((stat) => (
            <Card key={stat.label} className="animate-fade-in">
              <CardContent className="py-4 px-4">
                <p className="text-xs font-medium text-[#6e6e73] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{stat.value}</span>
                  <span className="text-sm text-[#6e6e73]">{stat.unit}</span>
                </div>
                <DeltaBadge value={stat.delta} unit={stat.unit} lowerIsBetter={stat.lowerIsBetter} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">Peso corporal</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">Últimas 6 semanas</p>
                </div>
                <DeltaBadge value={wDelta} unit="kg" lowerIsBetter />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <MiniChart data={weightHistory} color="#0071e3" unit=" kg" target={80} />
              <p className="text-[10px] text-[#aeaeb2] mt-1">--- Objetivo: 80 kg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">% Grasa corporal</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">Estimado</p>
                </div>
                <DeltaBadge value={bfDelta} unit="%" lowerIsBetter />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <MiniChart data={bodyFatHistory} color="#ff9f0a" unit="%" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">Medidas</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">Cintura y cadera</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#6e6e73]">Cintura</span>
                  <DeltaBadge value={waDelta} unit="cm" lowerIsBetter />
                </div>
                <MiniChart data={waistHistory} color="#30d158" unit=" cm" />
              </div>
              <div className="border-t border-[#e5e5ea] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#6e6e73]">Cadera</span>
                  <DeltaBadge value={hDelta} unit="cm" lowerIsBetter />
                </div>
                <MiniChart data={hipHistory} color="#bf5af2" unit=" cm" />
              </div>
            </CardContent>
          </Card>

          {/* Fotos de progreso — placeholder */}
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-[#1d1d1f]">Fotos de progreso</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {["Inicio", "Semana 4", "Ahora"].map((label) => (
                  <div key={label} className="flex-1 aspect-[3/4] bg-[#f2f2f4] rounded-xl flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e5e5ea] flex items-center justify-center">
                      <span className="text-lg">📷</span>
                    </div>
                    <span className="text-[10px] text-[#aeaeb2] font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
