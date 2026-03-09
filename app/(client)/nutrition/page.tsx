import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/ui/page-transition'
import { AddMealFab } from './add-meal-fab'
import { deleteNutritionLogAction } from './actions'
import { NutritionChecklist } from './nutrition-checklist'
import { calculateNutrition } from '@/lib/calculations/nutrition'
import type { Database } from '@/lib/supabase/types'

type ClientNutritionData = Pick<
  Database['public']['Tables']['clients']['Row'],
  'id' | 'weight_kg' | 'body_fat_pct' | 'phase' | 'objective' | 'lifestyle' | 'activity_level' | 'daily_steps' | 'goal'
>

type NutritionLogRow = Database['public']['Tables']['nutrition_logs']['Row']
type NutritionPlanRow = Database['public']['Tables']['nutrition_plans']['Row']
type NutritionPlanMealRow = Database['public']['Tables']['nutrition_plan_meals']['Row']
type NutritionMealLogRow = Database['public']['Tables']['nutrition_meal_logs']['Row']
type NutritionMealLogStatus = Pick<NutritionMealLogRow, 'meal_id' | 'completed' | 'grams'>
type NutritionPlanWithMeals = NutritionPlanRow & { meals: NutritionPlanMealRow[] }

type MacroTargets = {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

type MacroSummary = {
  label: string
  consumed: number
  target: number
  unit: string
}

function getDayString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

function formatValue(value: number, maxDecimals = 1): string {
  const shouldShowDecimals = Math.abs(value % 1) > 0
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: shouldShowDecimals ? 1 : 0,
    maximumFractionDigits: shouldShowDecimals ? maxDecimals : 0,
  })
}

function formatTime(dateIso: string): string {
  return new Date(dateIso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function clampProgress(consumed: number, target: number): number {
  if (target <= 0) return 0
  return Math.min((consumed / target) * 100, 100)
}

export default async function NutritionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let client: ClientNutritionData | null = null
  try {
    const { data } = await supabase
      .from('clients')
      .select('id, weight_kg, body_fat_pct, phase, objective, lifestyle, activity_level, daily_steps, goal')
      .eq('profile_id', user.id)
      .maybeSingle()
    client = data as ClientNutritionData | null
  } catch (error) {
    console.error('client fetch error:', error)
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const currentDateString = getDayString(now)

  let todayLogs: NutritionLogRow[] = []
  let activePlan: NutritionPlanWithMeals | null = null
  let mealLogs: NutritionMealLogStatus[] = []

  if (client?.id) {
    try {
      const [freeLogsRes, planRes, mealLogsRes] = await Promise.all([
        supabase
          .from('nutrition_logs')
          .select('id, client_id, logged_at, meal_name, kcal, protein_g, carbs_g, fat_g')
          .eq('client_id', client.id)
          .gte('logged_at', todayStart)
          .lt('logged_at', tomorrowStart)
          .order('logged_at', { ascending: true }),
        supabase
          .from('nutrition_plans')
          .select('*, meals:nutrition_plan_meals(*)')
          .eq('client_id', client.id)
          .eq('active', true)
          .maybeSingle(),
        supabase
          .from('nutrition_meal_logs')
          .select('meal_id, completed, grams')
          .eq('client_id', client.id)
          .eq('logged_date', currentDateString),
      ])

      if (!freeLogsRes.error && freeLogsRes.data) todayLogs = freeLogsRes.data as NutritionLogRow[]

      if (planRes.data) {
        const rawPlan = planRes.data as NutritionPlanWithMeals
        const sortedMeals = [...(rawPlan.meals ?? [])].sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        )
        activePlan = {
          ...rawPlan,
          meals: sortedMeals,
        }
      }

      if (mealLogsRes.data) {
        mealLogs = mealLogsRes.data as NutritionMealLogStatus[]
      }
    } catch (error) {
      console.error('nutrition data fetch error:', error)
    }
  }

  const fallbackTargets: MacroTargets = (() => {
    if (!client) return { kcal: 2000, protein: 150, carbs: 200, fat: 70 }
    const result = calculateNutrition({
      weightKg: client.weight_kg,
      bodyFatPct: client.body_fat_pct ?? 20,
      activityLevel: client.activity_level,
      dailySteps: client.daily_steps ?? 7000,
      goal: client.goal,
    })
    return {
      kcal: result.targetCalories,
      protein: result.macros.protein.g,
      carbs: result.macros.carbs.g,
      fat: result.macros.fat.g,
    }
  })()

  const targets: MacroTargets = activePlan
    ? {
        kcal: activePlan.kcal_target ?? fallbackTargets.kcal,
        protein: activePlan.protein_target_g ?? fallbackTargets.protein,
        carbs: activePlan.carbs_target_g ?? fallbackTargets.carbs,
        fat: activePlan.fat_target_g ?? fallbackTargets.fat,
      }
    : fallbackTargets

  let consumedKcal = todayLogs.reduce((sum, log) => sum + (log.kcal ?? 0), 0)
  let consumedProtein = todayLogs.reduce((sum, log) => sum + (log.protein_g ?? 0), 0)
  let consumedCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs_g ?? 0), 0)
  let consumedFat = todayLogs.reduce((sum, log) => sum + (log.fat_g ?? 0), 0)

  if (activePlan) {
    for (const meal of activePlan.meals) {
      const log = mealLogs.find((l) => l.meal_id === meal.id && l.completed)
      if (!log) continue
      const g = log.grams ?? meal.default_grams ?? 100
      consumedKcal += Math.round((meal.kcal_per_100g ?? 0) * g / 100)
      consumedProtein += Math.round((meal.protein_per_100g ?? 0) * g / 100)
      consumedCarbs += Math.round((meal.carbs_per_100g ?? 0) * g / 100)
      consumedFat += Math.round((meal.fat_per_100g ?? 0) * g / 100)
    }
  }

  const cards: MacroSummary[] = [
    { label: 'Kcal', consumed: consumedKcal, target: targets.kcal, unit: 'kcal' },
    { label: 'Proteína', consumed: consumedProtein, target: targets.protein, unit: 'g' },
    { label: 'Carbos', consumed: consumedCarbs, target: targets.carbs, unit: 'g' },
    { label: 'Grasa', consumed: consumedFat, target: targets.fat, unit: 'g' },
  ]

  const dateLabel = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-28">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#e8e8e6] tracking-tight">Nutrición</h1>
          <p className="text-sm text-[#a0a0a0] mt-0.5 capitalize">{dateLabel}</p>
        </div>

        <section className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
              <div
                key={card.label}
                className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4"
              >
                <p className="text-xs text-[#a0a0a0]">{card.label}</p>
                <div className="mt-2 flex items-end gap-1.5">
                  <p className="text-2xl leading-none font-[family-name:var(--font-geist-mono)] text-[#e8e8e6]">
                    {formatValue(card.consumed)}
                  </p>
                  <p className="text-xs text-[#a0a0a0] pb-0.5">
                    / {formatValue(card.target, 0)} {card.unit}
                  </p>
                </div>
                <div className="mt-3 h-[3px] bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6b7fa3]"
                    style={{ width: `${clampProgress(card.consumed, card.target)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {!activePlan && (
            <p className="text-xs text-[#a0a0a0] mt-3 text-center">
              Objetivos estimados · Tu entrenador puede asignarte un plan personalizado
            </p>
          )}
        </section>

        {activePlan && (
          <section className="mb-6">
            <p className="text-xs font-medium text-[#6b7fa3] tracking-wide uppercase mb-3">
              Plan del entrenador
            </p>
            <NutritionChecklist
              clientId={client?.id ?? ''}
              plan={activePlan}
              mealLogs={mealLogs}
              currentDate={currentDateString}
            />
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[#6b7fa3] tracking-wide uppercase">
              Registro libre
            </p>
          </div>

          {todayLogs.length === 0 ? (
            <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-5">
              <p className="text-sm text-[#a0a0a0]">Sin comidas registradas hoy</p>
            </div>
          ) : (
            <div>
              {todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 mb-2 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#e8e8e6]">{log.meal_name}</p>
                    <p className="text-xs text-[#a0a0a0] mt-0.5">
                      {`${formatValue(log.kcal ?? 0, 0)} kcal · ${formatValue(log.protein_g ?? 0)}g prot · ${formatValue(log.carbs_g ?? 0)}g carbs · ${formatValue(log.fat_g ?? 0)}g grasa`}
                    </p>
                    <p className="text-xs text-[#a0a0a0] mt-1">{formatTime(log.logged_at)}</p>
                  </div>

                  <form action={deleteNutritionLogAction.bind(null, log.id)}>
                    <button
                      type="submit"
                      className="text-[#a0a0a0] hover:text-[var(--danger)] transition-colors text-lg leading-none px-1"
                      aria-label={`Eliminar ${log.meal_name}`}
                    >
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <AddMealFab clientId={client?.id ?? ''} />
    </PageTransition>
  )
}
