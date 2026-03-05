import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { ClipboardList, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function RoutinesPage() {
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

  const { data: plans } = await supabase
    .from('workout_plans')
    .select(
      `id, name, active, days_per_week,
      workout_days (
        id, name, order_index,
        exercises (muscle_group)
      )`
    )
    .eq('client_id', client.id)
    .order('active', { ascending: false })

  const planList = plans ?? []

  if (planList.length === 0) {
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ClipboardList className="w-16 h-16 text-[var(--text-muted)] mb-4" />
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Sin planes de entrenamiento</p>
          <p className="text-sm text-[var(--text-secondary)]">Tu entrenador aún no ha creado tu plan</p>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Rutinas</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {planList.length} {planList.length === 1 ? 'plan disponible' : 'planes disponibles'}
          </p>
        </div>

        <div className="space-y-4 stagger">
          {planList.map((plan, i) => {
            const days = (plan.workout_days ?? []) as {
              id: string
              name: string
              order_index: number
              exercises: { muscle_group: string }[]
            }[]
            const sortedDays = [...days].sort((a, b) => a.order_index - b.order_index)
            const muscleGroups = [
              ...new Set(days.flatMap((d) => d.exercises.map((e) => e.muscle_group))),
            ]

            return (
              <div
                key={plan.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className={cn(
                    'rounded-lg border overflow-hidden bg-[var(--bg-surface)]',
                    plan.active ? 'border-[var(--accent)]' : 'border-[var(--border)]'
                  )}
                >
                  {/* Franja activo */}
                  {plan.active && <div className="h-1 bg-[var(--accent)] w-full" />}

                  {/* Cabecera del plan */}
                  <div className="px-5 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {plan.name}
                      </h2>
                      {plan.active && (
                        <span className="flex-shrink-0 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-full">
                          Activo
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {plan.days_per_week} días / semana
                    </p>

                    {muscleGroups.length > 0 && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {muscleGroups.slice(0, 4).join(' · ')}
                        {muscleGroups.length > 4 && ' · …'}
                      </p>
                    )}
                  </div>

                  {/* Lista de días */}
                  {sortedDays.length > 0 && (
                    <div className="px-5 py-3 border-t border-[var(--border)] space-y-2">
                      {sortedDays.map((day) => (
                        <div key={day.id} className="flex items-center gap-2.5 min-h-[28px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          <span className="text-sm text-[var(--text-secondary)]">{day.name}</span>
                          {day.exercises.length > 0 && (
                            <span className="ml-auto text-xs text-[var(--text-muted)]">
                              {day.exercises.length} ejerc.
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón empezar */}
                  <div className="px-5 py-4 border-t border-[var(--border)]">
                    <Link href={`/routines/${plan.id}`} className="block">
                      <button className="w-full min-h-[44px] bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold text-sm rounded-md flex items-center justify-center gap-2 transition-colors hover:opacity-90">
                        <Play className="w-4 h-4 fill-[var(--bg-base)] stroke-none" />
                        Empezar Rutina
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
}
