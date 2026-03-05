"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";
import { Plus, Flame, Check, X } from "lucide-react";

const goals = {
  calories: 2671,
  protein: 149,
  carbs: 352,
  fat: 74,
};

const initialMeals = [
  {
    id: 1,
    name: "Desayuno",
    time: "08:30",
    items: [
      { name: "Avena con leche", calories: 320, protein: 14, carbs: 52, fat: 7 },
      { name: "Plátano", calories: 89, protein: 1, carbs: 23, fat: 0 },
    ],
  },
  {
    id: 2,
    name: "Comida",
    time: "14:00",
    items: [
      { name: "Arroz integral", calories: 215, protein: 5, carbs: 45, fat: 2 },
      { name: "Pechuga de pollo", calories: 165, protein: 31, carbs: 0, fat: 4 },
      { name: "Verduras al vapor", calories: 55, protein: 3, carbs: 10, fat: 0 },
    ],
  },
  {
    id: 3,
    name: "Merienda",
    time: "17:30",
    items: [
      { name: "Yogur griego", calories: 130, protein: 17, carbs: 6, fat: 4 },
    ],
  },
  {
    id: 4,
    name: "Cena",
    time: "21:00",
    items: [],
  },
];

type MacroKey = "protein" | "carbs" | "fat";

const macros: { key: MacroKey; label: string; color: string; goal: number }[] = [
  { key: "protein", label: "Proteína", color: "#0071e3", goal: goals.protein },
  { key: "carbs", label: "Carbohidratos", color: "#30d158", goal: goals.carbs },
  { key: "fat", label: "Grasa", color: "#ff9f0a", goal: goals.fat },
];

function sum(meals: typeof initialMeals, key: "calories" | MacroKey) {
  return meals.flatMap((m) => m.items).reduce((acc, i) => acc + i[key], 0);
}

export default function NutritionPage() {
  const [meals] = useState(initialMeals);
  const [showAdd, setShowAdd] = useState(false);

  const consumed = {
    calories: sum(meals, "calories"),
    protein: sum(meals, "protein"),
    carbs: sum(meals, "carbs"),
    fat: sum(meals, "fat"),
  };

  const remaining = goals.calories - consumed.calories;
  const calPct = Math.min((consumed.calories / goals.calories) * 100, 100);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Nutrición</h1>
            <p className="text-sm text-[#6e6e73] mt-0.5">Miércoles, 4 de marzo</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 bg-[#0071e3] rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Calorías */}
        <Card className="mb-4">
          <CardContent className="py-5 px-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff9f0a]" />
                <span className="text-sm font-semibold text-[#1d1d1f]">Calorías</span>
              </div>
              <span className={cn("text-xs font-medium", remaining >= 0 ? "text-[#30d158]" : "text-[#ff375f]")}>
                {remaining >= 0 ? `${remaining} kcal restantes` : `${Math.abs(remaining)} kcal excedidas`}
              </span>
            </div>

            {/* Barra principal */}
            <div className="h-3 bg-[#f2f2f4] rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${calPct}%`,
                  backgroundColor: calPct > 100 ? "#ff375f" : calPct > 85 ? "#ff9f0a" : "#30d158",
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-[#6e6e73]">
              <span><span className="text-[#1d1d1f] font-semibold text-base">{consumed.calories}</span> consumidas</span>
              <span>Objetivo: <span className="font-medium text-[#1d1d1f]">{goals.calories}</span> kcal</span>
            </div>
          </CardContent>
        </Card>

        {/* Macros */}
        <Card className="mb-5">
          <CardContent className="py-4 px-5 space-y-3">
            {macros.map((m) => {
              const val = consumed[m.key];
              const pct = Math.min((val / m.goal) * 100, 100);
              return (
                <div key={m.key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-[#6e6e73]">{m.label}</span>
                    <span className="text-xs font-medium text-[#1d1d1f]">
                      {val}g <span className="text-[#aeaeb2] font-normal">/ {m.goal}g</span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#f2f2f4] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Comidas */}
        <div className="space-y-3">
          {meals.map((meal) => {
            const mealCals = meal.items.reduce((a, i) => a + i.calories, 0);
            return (
              <Card key={meal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1d1d1f]">{meal.name}</p>
                      <span className="text-xs text-[#aeaeb2]">{meal.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {mealCals > 0 && (
                        <span className="text-xs font-medium text-[#6e6e73]">{mealCals} kcal</span>
                      )}
                      <button className="w-6 h-6 rounded-lg bg-[#f2f2f4] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors">
                        <Plus className="w-3.5 h-3.5 text-[#6e6e73]" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                {meal.items.length > 0 && (
                  <CardContent className="p-0">
                    {meal.items.map((item, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center justify-between px-5 py-2.5",
                          i < meal.items.length - 1 && "border-b border-[#f2f2f4]"
                        )}
                      >
                        <span className="text-sm text-[#1d1d1f]">{item.name}</span>
                        <div className="flex items-center gap-3 text-xs text-[#aeaeb2]">
                          <span>{item.protein}P</span>
                          <span>{item.carbs}C</span>
                          <span>{item.fat}G</span>
                          <span className="text-[#6e6e73] font-medium">{item.calories}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
                {meal.items.length === 0 && (
                  <CardContent className="py-3 px-5">
                    <p className="text-xs text-[#aeaeb2]">Sin registrar</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Modal añadir alimento */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#1d1d1f]">Añadir alimento</h2>
                <button onClick={() => setShowAdd(false)}>
                  <X className="w-5 h-5 text-[#6e6e73]" />
                </button>
              </div>
              <input
                autoFocus
                placeholder="Buscar alimento..."
                className="w-full px-4 py-3 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:ring-1 focus:ring-[#0071e3] mb-4"
              />
              <p className="text-xs text-[#aeaeb2] text-center">Base de datos de alimentos — próximamente</p>
              <button
                onClick={() => setShowAdd(false)}
                className="w-full mt-4 py-3 bg-[#0071e3] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
