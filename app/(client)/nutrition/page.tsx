import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingBag, Plus } from 'lucide-react'
import { PageTransition } from '@/components/ui/page-transition'
import { MacroProgressBars } from '@/components/client/nutrition/MacroProgressBars'
import { ClientDailyMeals } from '@/components/client/nutrition/ClientDailyMeals'
import { FoodSearchModal } from '@/components/client/nutrition/FoodSearchModal'
import { AIFoodParserModal } from '@/components/client/nutrition/AIFoodParserModal'
import { getClientNutritionContextAction } from './actions'
import type { Database } from '@/lib/supabase/types'

function getDayString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

export default async function NutritionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let client: any = null
  try {
    const { data } = await supabase
      .from('clients')
      .select('id, weight_kg, body_fat_pct, phase, objective, lifestyle, activity_level, daily_steps, goal')
      .eq('profile_id', user.id)
      .maybeSingle()
    client = data
  } catch (error) {
    console.error('client fetch error:', error)
  }

  if (!client) {
    return <div>No se encontró la información del cliente.</div>
  }

  const now = new Date()
  const currentDateString = getDayString(now)

  const { data: context } = await getClientNutritionContextAction(client.id, currentDateString)

  const dateLabel = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // We are temporarily hiding the checklist and free logs since 11-02 and 11-03 will rebuild them
  // with the new `food_log` table instead of the deprecated `nutrition_logs` and `nutrition_meal_logs`.

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-28">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#e8e8e6] tracking-tight">Nutrición</h1>
            <p className="text-sm text-[#a0a0a0] mt-0.5 capitalize">{dateLabel}</p>
          </div>
          <Link
            href="/nutrition/shopping-list"
            className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#e8e8e6] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            title="Lista de la compra"
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>

        <MacroProgressBars
          targets={context?.activePlan ? {
            kcal: context.activePlan.kcal_target || 1,
            protein: context.activePlan.protein_target_g || 1,
            carbs: context.activePlan.carbs_target_g || 1,
            fat: context.activePlan.fat_target_g || 1
          } : null}
          consumed={context?.consumed || { kcal: 0, protein: 0, carbs: 0, fat: 0 }}
        />

        {/* Plan Section */}
        <section className="mb-6">
          <p className="text-xs font-medium text-[#6b7fa3] tracking-wide uppercase mb-3">
            Plan del entrenador
          </p>
          {context?.activePlan ? (
            <ClientDailyMeals
              clientId={client.id}
              dateStr={currentDateString}
              plan={context.activePlan}
              logs={context.logs}
            />
          ) : (
            <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-5 text-center">
              <p className="text-sm text-[#a0a0a0]">No hay plan activo disponible</p>
            </div>
          )}
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[#6b7fa3] tracking-wide uppercase">
              Registro libre
            </p>
            <div className="flex items-center gap-2">
              <AIFoodParserModal clientId={client.id} />
              <FoodSearchModal
                clientId={client.id}
                dateStr={currentDateString}
                trigger={
                  <button className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#e8e8e6] hover:bg-[rgba(255,255,255,0.12)] transition-colors">
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                }
              />
            </div>
          </div>

          {(() => {
            const freeLogs = context?.logs?.filter(l => l.meal_number === null) || []
            if (freeLogs.length === 0) {
              return (
                <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-8 text-center flex flex-col items-center justify-center">
                  <p className="text-sm text-[#a0a0a0] mb-2">No has registrado alimentos libres hoy</p>
                  <p className="text-xs text-[#6b7fa3]">Usa el botón + para buscar y añadir comidas</p>
                </div>
              )
            }
            return (
              <div className="space-y-3">
                {freeLogs.map((log: any) => {
                  const item = log.food || log.dish
                  const name = item?.name || 'Comida'
                  const kcal = item ? Math.round(item.kcal_per_100g * (log.grams / 100)) : 0
                  return (
                    <div key={log.id} className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-[#e8e8e6]">{name}</p>
                        <p className="text-xs text-[#a0a0a0] mt-0.5">{log.grams}g</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#e8e8e6]">{kcal} kcal</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </section>
      </div>

    </PageTransition>
  )
}
