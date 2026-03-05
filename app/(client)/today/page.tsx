"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SetLog = {
  weight: string;
  reps: string;
  rir: string;
  done: boolean;
};

type Exercise = {
  id: number;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string;
  targetRir: number;
  isPR?: boolean;
  sets: SetLog[];
};

const initialExercises: Exercise[] = [
  {
    id: 1,
    name: "Sentadilla con barra",
    muscleGroup: "Cuádriceps",
    targetSets: 4,
    targetReps: "6–8",
    targetRir: 2,
    sets: [
      { weight: "100", reps: "8", rir: "2", done: true },
      { weight: "100", reps: "7", rir: "2", done: true },
      { weight: "", reps: "", rir: "", done: false },
      { weight: "", reps: "", rir: "", done: false },
    ],
  },
  {
    id: 2,
    name: "Peso muerto rumano",
    muscleGroup: "Isquios / Glúteos",
    targetSets: 3,
    targetReps: "8–10",
    targetRir: 2,
    sets: [
      { weight: "", reps: "", rir: "", done: false },
      { weight: "", reps: "", rir: "", done: false },
      { weight: "", reps: "", rir: "", done: false },
    ],
  },
  {
    id: 3,
    name: "Prensa inclinada",
    muscleGroup: "Cuádriceps",
    targetSets: 3,
    targetReps: "10–12",
    targetRir: 1,
    isPR: true,
    sets: [
      { weight: "", reps: "", rir: "", done: false },
      { weight: "", reps: "", rir: "", done: false },
      { weight: "", reps: "", rir: "", done: false },
    ],
  },
];

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [sets, setSets] = useState(exercise.sets);
  const [expanded, setExpanded] = useState(true);

  const completedSets = sets.filter((s) => s.done).length;

  const updateSet = (
    i: number,
    field: keyof SetLog,
    value: string | boolean
  ) => {
    setSets((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );
  };

  const completeSet = (i: number) => {
    if (sets[i].weight && sets[i].reps && sets[i].rir !== "") {
      updateSet(i, "done", true);
    }
  };

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              completedSets === sets.length
                ? "bg-[#30d158]/15 text-[#248a3d]"
                : "bg-[#f2f2f4] text-[#6e6e73]"
            )}
          >
            {completedSets}/{sets.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#1d1d1f]">
                {exercise.name}
              </p>
              {exercise.isPR && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#ff9f0a] bg-[#ff9f0a]/10 px-1.5 py-0.5 rounded-full">
                  <Trophy className="w-2.5 h-2.5" /> PR
                </span>
              )}
            </div>
            <p className="text-xs text-[#aeaeb2]">
              {exercise.muscleGroup} · {exercise.targetReps} reps · RIR{" "}
              {exercise.targetRir}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#aeaeb2]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#aeaeb2]" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#e5e5ea]">
          {/* Header de columnas */}
          <div className="grid grid-cols-4 gap-2 px-5 py-2 bg-[#f5f5f7]">
            {["Serie", "Peso (kg)", "Reps", "RIR"].map((h) => (
              <p key={h} className="text-[10px] font-medium text-[#aeaeb2] uppercase tracking-wide">
                {h}
              </p>
            ))}
          </div>

          {sets.map((set, i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-4 gap-2 items-center px-5 py-2.5 border-t border-[#e5e5ea]",
                set.done && "bg-[#30d158]/5"
              )}
            >
              <div className="flex items-center gap-2">
                {set.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                ) : (
                  <Circle className="w-4 h-4 text-[#d2d2d7]" />
                )}
                <span className="text-sm text-[#6e6e73]">{i + 1}</span>
              </div>

              {(["weight", "reps", "rir"] as const).map((field) => (
                <input
                  key={field}
                  type="number"
                  value={set[field] as string}
                  onChange={(e) => updateSet(i, field, e.target.value)}
                  onBlur={() => completeSet(i)}
                  disabled={set.done}
                  placeholder={
                    field === "weight" ? "—" : field === "reps" ? "—" : "—"
                  }
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-sm text-center border transition-all focus:outline-none",
                    set.done
                      ? "bg-transparent border-transparent text-[#6e6e73] cursor-not-allowed"
                      : "bg-[#f5f5f7] border-[#e5e5ea] text-[#1d1d1f] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function TodayPage() {
  const [exercises] = useState(initialExercises);
  const completedCount = exercises.filter((e) =>
    e.sets.every((s) => s.done)
  ).length;

  return (
    <PageTransition>
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-[#6e6e73] uppercase tracking-wider">
            Miércoles, 4 de marzo
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#ff9f0a] font-medium">
            <Flame className="w-3.5 h-3.5" />
            Racha 12 días
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
          Día A — Cuádriceps
        </h1>

        {/* Progreso global */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#e5e5ea] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
              style={{
                width: `${(completedCount / exercises.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm text-[#6e6e73] font-medium whitespace-nowrap">
            {completedCount}/{exercises.length} ejercicios
          </span>
        </div>
      </div>

      {/* Ejercicios */}
      <div className="space-y-3 stagger">
        {exercises.map((exercise, i) => (
          <div key={exercise.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <ExerciseCard exercise={exercise} />
          </div>
        ))}
      </div>

      {/* Finalizar */}
      <div className="mt-6">
        <Button className="w-full" size="lg">
          <CheckCircle2 className="w-5 h-5" />
          Finalizar entrenamiento
        </Button>
      </div>
    </div>
    </PageTransition>
  );
}
