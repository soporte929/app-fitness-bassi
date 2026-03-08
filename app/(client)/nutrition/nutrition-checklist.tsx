'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { upsertMealLogAction } from './nutrition-actions'
import type { Database } from '@/lib/supabase/types'

type NutritionPlanRow = Database['public']['Tables']['nutrition_plans']['Row']
type NutritionPlanMealRow = Database['public']['Tables']['nutrition_plan_meals']['Row']
type NutritionMealLogRow = Database['public']['Tables']['nutrition_meal_logs']['Row']
type NutritionMealLogData = Pick<NutritionMealLogRow, 'meal_id' | 'completed' | 'grams'>
type NutritionPlanWithMeals = NutritionPlanRow & { meals: NutritionPlanMealRow[] }

type NutritionChecklistProps = {
  clientId: string
  plan: NutritionPlanWithMeals
  mealLogs: NutritionMealLogData[]
  currentDate: string
}

function calcMacros(meal: NutritionPlanMealRow, grams: number) {
  return {
    kcal: Math.round((meal.kcal_per_100g ?? 0) * grams / 100),
    protein: Math.round((meal.protein_per_100g ?? 0) * grams / 100),
    carbs: Math.round((meal.carbs_per_100g ?? 0) * grams / 100),
    fat: Math.round((meal.fat_per_100g ?? 0) * grams / 100),
  }
}

export function NutritionChecklist({
  clientId,
  plan,
  mealLogs,
  currentDate,
}: NutritionChecklistProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const log of mealLogs) {
      map[log.meal_id] = log.completed
    }
    return map
  })

  const [gramsMap, setGramsMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const meal of plan.meals) {
      const log = mealLogs.find((l) => l.meal_id === meal.id)
      map[meal.id] = log?.grams ?? meal.default_grams ?? 100
    }
    return map
  })

  if (plan.meals.length === 0) {
    return (
      <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-5 text-center">
        <p className="text-sm text-[#a0a0a0]">Tu entrenador aún no ha añadido comidas al plan</p>
      </div>
    )
  }

  const upsert = (mealId: string, completed: boolean, grams: number) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await upsertMealLogAction(mealId, clientId, currentDate, completed, grams)
      if (!res.success) setErrorMsg(res.error ?? 'Error al guardar')
    })
  }

  const handleToggle = (mealId: string) => {
    const newCompleted = !completedMap[mealId]
    setCompletedMap((prev) => ({ ...prev, [mealId]: newCompleted }))
    upsert(mealId, newCompleted, gramsMap[mealId] ?? 100)
  }

  const handleGramsChange = (mealId: string, raw: string) => {
    const num = parseInt(raw)
    const safeNum = Number.isNaN(num) ? 0 : Math.max(0, num)
    setGramsMap((prev) => ({ ...prev, [mealId]: safeNum }))
  }

  const handleGramsBlur = (mealId: string) => {
    const grams = Math.max(1, gramsMap[mealId] ?? 1)
    setGramsMap((prev) => ({ ...prev, [mealId]: grams }))
    if (completedMap[mealId]) {
      upsert(mealId, true, grams)
    }
  }

  return (
    <div className="space-y-2">
      {errorMsg && (
        <p className="text-xs text-[#f87171] px-1 pb-1">{errorMsg}</p>
      )}
      <div
        className={`space-y-2 transition-opacity duration-200 ${
          isPending ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        {plan.meals.map((meal) => {
          const isCompleted = completedMap[meal.id] ?? false
          const grams = gramsMap[meal.id] ?? meal.default_grams ?? 100
          const macros = calcMacros(meal, grams)

          return (
            <div
              key={meal.id}
              className="bg-[#212121] rounded-xl px-4 py-3 flex items-center gap-3 border border-[rgba(255,255,255,0.07)]"
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(meal.id)}
                aria-label={`Marcar ${meal.name} como completada`}
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-[#6b7fa3] text-white'
                    : 'border border-[rgba(255,255,255,0.2)] text-transparent'
                }`}
              >
                {isCompleted && <Check size={12} color="white" />}
              </button>

              {/* Meal info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isCompleted ? 'text-[#a0a0a0] line-through opacity-70' : 'text-[#e8e8e6]'
                  }`}
                >
                  {meal.name}
                </p>
                <p className="text-[11px] text-[#a0a0a0] mt-0.5">
                  {macros.kcal} kcal · {macros.protein}g prot · {macros.carbs}g carbs · {macros.fat}g grasa
                </p>
              </div>

              {/* Right: time + grams input */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {meal.meal_time && (
                  <span className="text-[11px] text-[#a0a0a0]">{meal.meal_time}</span>
                )}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    value={gramsMap[meal.id] ?? meal.default_grams ?? 100}
                    onChange={(e) => handleGramsChange(meal.id, e.target.value)}
                    onBlur={() => handleGramsBlur(meal.id)}
                    aria-label={`Gramos de ${meal.name}`}
                    className="w-14 text-[11px] text-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-md px-1 py-0.5 text-[#e8e8e6] focus:outline-none focus:border-[rgba(107,127,163,0.6)] transition-colors"
                  />
                  <span className="text-[11px] text-[#a0a0a0]">g</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
