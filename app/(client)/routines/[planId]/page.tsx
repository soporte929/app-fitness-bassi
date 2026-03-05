import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { ChevronLeft } from 'lucide-react'
import { PlanDayCard } from '@/components/client/plan-day-card'
import type { DayWithExercises } from '@/components/client/plan-day-card'
import { StartWorkoutButton } from './start-button'
import type { Database } from '@/lib/supabase/types'

type PlanRow = Database['public']['Tables']['workout_plans']['Row']

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!client) redirect('/login')

  const { data: rawPlan } = await supabase
    .from('workout_plans')
    .select(
      `id, name, active, days_per_week, client_id,
      workout_days (
        id, name, order_index,
        exercises (
          id, name, muscle_group, target_sets, target_reps, target_rir, order_index, notes
        )
      )`
    )
    .eq('id', planId)
    .single()

  // Verificar que el plan pertenece al cliente autenticado
  if (!rawPlan || (rawPlan as Pick<PlanRow, 'client_id'>).client_id !== client.id) {
    notFound()
  }

  const plan = rawPlan as typeof rawPlan & { client_id: string }

  const days: DayWithExercises[] = ((plan.workout_days ?? []) as DayWithExercises[])
    .sort((a, b) => a.order_index - b.order_index)
    .map((d) => ({
      ...d,
      exercises: [...d.exercises].sort((a, b) => a.order_index - b.order_index),
    }))

  const muscleGroups = [...new Set(days.flatMap((d) => d.exercises.map((e) => e.muscle_group)))]

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-36">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/routines"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{plan.name}</h1>
              {plan.active && (
                <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {plan.days_per_week} días / semana
              {muscleGroups.length > 0 &&
                ` · ${muscleGroups.slice(0, 3).join(' · ')}${muscleGroups.length > 3 ? ' · …' : ''}`}
            </p>
          </div>
        </div>

        {/* Estado vacío */}
        {days.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Sin días configurados</p>
            <p className="text-sm text-[var(--text-secondary)]">Este plan aún no tiene días configurados</p>
          </div>
        ) : (
          <div className="space-y-3 stagger">
            {days.map((day, i) => (
              <PlanDayCard key={day.id} day={day} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Footer fijo encima del nav */}
      {days.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-20 pt-4 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <StartWorkoutButton />
          </div>
        </div>
      )}
    </PageTransition>
  )
}
