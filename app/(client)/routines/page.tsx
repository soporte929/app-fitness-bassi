import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { ClipboardList, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type WorkoutDay = {
  id: string
  name: string
  order_index: number
  exercises: { muscle_group: string }[]
}

type Routine = {
  id: string
  name: string
  days_per_week: number
  workout_days: WorkoutDay[]
}

type PlanRoutineRaw = {
  routine: Routine | null
}

type ClientPlanRaw = {
  plan: {
    id: string
    name: string
    plan_routines: PlanRoutineRaw[]
  } | null
}

export default async function RoutinesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (clientError) return <p style={{ color: 'red' }}>CLIENT ERROR: {clientError.message}</p>
  if (!client) return <p style={{ color: 'red' }}>CLIENT NULL - user.id: {user?.id}</p>

  const { data: clientPlanRaw, error: planError } = await supabase
    .from('client_plans')
    .select(
      `plan:plans!client_plans_plan_id_fkey(
        id, name,
        plan_routines!plan_routines_plan_id_fkey(
          routine:workout_plans!plan_routines_workout_plan_id_fkey(
            id, name, days_per_week,
            workout_days(
              id, name, order_index,
              exercises(muscle_group)
            )
          )
        )
      )`
    )
    .eq('client_id', client.id)
    .eq('active', true)
    .maybeSingle()

  if (planError) return <p style={{ color: 'red' }}>PLAN ERROR: {planError.message}</p>
  if (!clientPlanRaw) return <p style={{ color: 'red' }}>PLAN NULL - client.id: {client?.id}</p>

  const clientPlan = clientPlanRaw as ClientPlanRaw | null
  const planRoutines = (clientPlan?.plan?.plan_routines ?? []) as PlanRoutineRaw[]
  const planList = planRoutines
    .map((pr) => pr.routine)
    .filter((r): r is Routine => r !== null)

  if (planList.length === 0) {
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ClipboardList className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Sin rutinas asignadas</p>
          <p className="text-sm text-[var(--text-secondary)]">Tu entrenador aún no ha asignado un plan</p>
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
            {planList.length} {planList.length === 1 ? 'rutina disponible' : 'rutinas disponibles'}
          </p>
        </div>

        <div className="space-y-4 stagger">
          {planList.map((routine, i) => {
            const days = routine.workout_days ?? []
            const sortedDays = [...days].sort((a, b) => a.order_index - b.order_index)
            const muscleGroups = [
              ...new Set(days.flatMap((d) => d.exercises.map((e) => e.muscle_group))),
            ]

            return (
              <div
                key={routine.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={cn('rounded-lg border overflow-hidden bg-[var(--bg-surface)]', 'border-[var(--border)]')}>
                  {/* Cabecera */}
                  <div className="px-5 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {routine.name}
                      </h2>
                    </div>

                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {routine.days_per_week} días / semana
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
                    <Link href={`/routines/${routine.id}`} className="block">
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
