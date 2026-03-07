import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/ui/page-transition'
import { AddMealFab } from './add-meal-fab'
import { deleteNutritionLogAction } from './actions'
import { NutritionChecklist } from './nutrition-checklist'
import type { Database, Phase } from '@/lib/supabase/types'

type ClientNutritionData = Pick<
  Database['public']['Tables']['clients']['Row'],
  'id' | 'weight_kg' | 'phase' | 'objective' | 'lifestyle'
>

type NutritionLogRow = Database['public']['Tables']['nutrition_logs']['Row']
type NutritionPlanRow = Database['public']['Tables']['nutrition_plans']['Row']
type NutritionPlanMealRow = Database['public']['Tables']['nutrition_plan_meals']['Row']
type NutritionMealLogRow = Database['public']['Tables']['nutrition_meal_logs']['Row']
type NutritionMealLogStatus = Pick<NutritionMealLogRow, 'meal_id' | 'completed'>
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

function getKcalByPhase(phase: Phase): number {
  if (phase === 'deficit') return 1800
  if (phase === 'surplus') return 2800
  return 2400
}

function buildTargets(client: ClientNutritionData | null): MacroTargets {
  const weight = client?.weight_kg ?? 70

  // Placeholder adjustments until trainer custom targets are implemented.
  const objectiveAdjustment = client?.objective ? 0 : 0
  const lifestyleAdjustment = client?.lifestyle ? 0 : 0

  const protein = Math.round(weight * 2.2)
  const fat = Math.round(weight * 1)
  const kcal = getKcalByPhase(client?.phase ?? 'maintenance') + objectiveAdjustment + lifestyleAdjustment
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))

  return { kcal, protein, carbs, fat }
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
      .select('*')
      .eq('profile_id', user.id)
      .returns<ClientNutritionData>()
      .single()
    client = data
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
          .select('*')
          .eq('client_id', client.id)
          .gte('logged_at', todayStart)
          .lt('logged_at', tomorrowStart)
          .order('logged_at', { ascending: true })
          .returns<NutritionLogRow[]>(),
        supabase
          .from('nutrition_plans')
          .select('*, meals:nutrition_plan_meals(*)')
          .eq('client_id', client.id)
          .eq('active', true)
          .returns<NutritionPlanWithMeals>()
          .single(),
        supabase
          .from('nutrition_meal_logs')
          .select('meal_id, completed')
          .eq('client_id', client.id)
          .eq('logged_date', currentDateString)
          .returns<NutritionMealLogStatus[]>(),
      ])

      if (!freeLogsRes.error && freeLogsRes.data) todayLogs = freeLogsRes.data

      if (planRes.data) {
        const sortedMeals = [...(planRes.data.meals ?? [])].sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        )
        activePlan = {
          ...planRes.data,
          meals: sortedMeals,
        }
      }

      if (mealLogsRes.data) {
        mealLogs = mealLogsRes.data
      }
    } catch (error) {
      console.error('nutrition data fetch error:', error)
    }
  }

  const fallbackTargets = buildTargets(client)
  const targets = activePlan
    ? {
        kcal: activePlan.kcal_target ?? fallbackTargets.kcal,
        protein: activePlan.protein_target_g ?? fallbackTargets.protein,
        carbs: activePlan.carbs_target_g ?? fallbackTargets.carbs,
        fat: activePlan.fat_target_g ?? fallbackTargets.fat,
      }
    : null

  let consumedKcal = todayLogs.reduce((sum, log) => sum + (log.kcal ?? 0), 0)
  let consumedProtein = todayLogs.reduce((sum, log) => sum + (log.protein_g ?? 0), 0)
  let consumedCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs_g ?? 0), 0)
  let consumedFat = todayLogs.reduce((sum, log) => sum + (log.fat_g ?? 0), 0)

  if (activePlan) {
    const completedMealIds = new Set(mealLogs.filter((log) => log.completed).map((log) => log.meal_id))
    activePlan.meals.forEach((meal) => {
      if (completedMealIds.has(meal.id)) {
        consumedKcal += meal.kcal ?? 0
        consumedProtein += meal.protein_g ?? 0
        consumedCarbs += meal.carbs_g ?? 0
        consumedFat += meal.fat_g ?? 0
      }
    })
  }

  const cards: MacroSummary[] = targets
    ? [
        { label: 'Kcal', consumed: consumedKcal, target: targets.kcal, unit: 'kcal' },
        { label: 'Proteína', consumed: consumedProtein, target: targets.protein, unit: 'g' },
        { label: 'Carbos', consumed: consumedCarbs, target: targets.carbs, unit: 'g' },
        { label: 'Grasa', consumed: consumedFat, target: targets.fat, unit: 'g' },
      ]
    : []

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
          {cards.length > 0 ? (
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
          ) : (
            <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-6 text-center">
              <p className="text-sm text-[#a0a0a0]">Tu entrenador aún no ha configurado tu plan nutricional</p>
            </div>
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
