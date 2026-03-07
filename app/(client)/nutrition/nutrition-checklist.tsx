'use client'

import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { toggleMealLogAction } from './nutrition-actions'
import type { Database } from '@/lib/supabase/types'

type NutritionPlanRow = Database['public']['Tables']['nutrition_plans']['Row']
type NutritionPlanMealRow = Database['public']['Tables']['nutrition_plan_meals']['Row']
type NutritionMealLogStatus = Pick<
  Database['public']['Tables']['nutrition_meal_logs']['Row'],
  'meal_id' | 'completed'
>
type NutritionPlanWithMeals = NutritionPlanRow & { meals: NutritionPlanMealRow[] }

type NutritionChecklistProps = {
  clientId: string
  plan: NutritionPlanWithMeals | null
  mealLogs: NutritionMealLogStatus[]
  currentDate: string
}

export function NutritionChecklist({
  clientId,
  plan,
  mealLogs,
  currentDate,
}: NutritionChecklistProps) {
  const [isPending, startTransition] = useTransition()

  if (!plan || plan.meals.length === 0) {
    return (
      <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-5 text-center">
        <p className="text-sm text-[#a0a0a0]">Tu entrenador aún no ha configurado tu plan nutricional</p>
      </div>
    )
  }

  const toggleMealLog = (mealId: string, currentlyCompleted: boolean) => {
    startTransition(async () => {
      try {
        await toggleMealLogAction(mealId, clientId, currentDate, currentlyCompleted)
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <div className="space-y-2 relative">
      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
        {plan.meals.map((meal) => {
          const log = mealLogs.find((entry) => entry.meal_id === meal.id)
          const isCompleted = Boolean(log?.completed)
          const g = meal.default_grams ?? 100
          const macros = `${Math.round((meal.kcal_per_100g ?? 0) * g / 100)} kcal · ${Math.round((meal.protein_per_100g ?? 0) * g / 100)}g prot · ${Math.round((meal.carbs_per_100g ?? 0) * g / 100)}g carbs · ${Math.round((meal.fat_per_100g ?? 0) * g / 100)}g grasa`

          return (
            <div
              key={meal.id}
              className="bg-[#212121] rounded-xl px-4 py-3 mb-2 flex items-center gap-3 border border-[rgba(255,255,255,0.07)]"
            >
              <button
                type="button"
                onClick={() => toggleMealLog(meal.id, isCompleted)}
                aria-label={`Marcar ${meal.name}`}
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-[#6b7fa3] text-white'
                    : 'border border-[rgba(255,255,255,0.2)] text-transparent'
                }`}
              >
                {isCompleted && <Check size={12} color="white" />}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`truncate text-sm font-medium ${
                    isCompleted ? 'text-[#a0a0a0] line-through opacity-70' : 'text-[#e8e8e6]'
                  }`}
                >
                  {meal.name}
                </p>
                <p className="truncate text-[11px] text-[#a0a0a0] mt-0.5">{macros}</p>
              </div>

              {meal.meal_time && <span className="text-[11px] text-[#a0a0a0] flex-shrink-0">{meal.meal_time}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
