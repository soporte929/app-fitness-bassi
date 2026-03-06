import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from '@/components/client/exercise-card'
import { CheckCircle2, Flame, Dumbbell } from 'lucide-react'
import { finishWorkout } from './actions'

function calcStreak(sessions: { started_at: string }[]): number {
  if (sessions.length === 0) return 0
  const dates = new Set(sessions.map((s) => s.started_at.substring(0, 10)))
  const now = new Date()
  let current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (!dates.has(current.toISOString().substring(0, 10))) {
    current = new Date(current.getTime() - 86400000)
  }
  let streak = 0
  while (dates.has(current.toISOString().substring(0, 10))) {
    streak++
    current = new Date(current.getTime() - 86400000)
  }
  return streak
}

export default async function TodayPage() {
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

  const now = new Date()
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString()
  const todayEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  ).toISOString()

  const [sessionResult, streakResult] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id, day_id')
      .eq('client_id', client.id)
      .eq('completed', false)
      .gte('started_at', todayStart)
      .lte('started_at', todayEnd)
      .maybeSingle(),
    supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('client_id', client.id)
      .eq('completed', true)
      .order('started_at', { ascending: false })
      .limit(365),
  ])

  const streak = calcStreak(streakResult.data ?? [])
  const session = sessionResult.data

  const dateLabel = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  if (!session) {
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Dumbbell className="w-16 h-16 text-[var(--text-muted)] mb-4" />
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
            No tienes entreno programado para hoy
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Empieza una rutina cuando quieras</p>
          <Link href="/routines">
            <Button>Ver mis rutinas</Button>
          </Link>
        </div>
      </PageTransition>
    )
  }

  const [exercisesResult, setLogsResult, dayResult, lastSessionResult] = await Promise.all([
    supabase
      .from('exercises')
      .select('id, name, muscle_group, target_sets, target_reps, target_rir, order_index')
      .eq('day_id', session.day_id)
      .order('order_index'),
    supabase
      .from('set_logs')
      .select('id, exercise_id, set_number, weight_kg, reps, rir, completed')
      .eq('session_id', session.id),
    supabase.from('workout_days').select('name').eq('id', session.day_id).single(),
    supabase
      .from('workout_sessions')
      .select('id')
      .eq('client_id', client.id)
      .eq('day_id', session.day_id)
      .eq('completed', true)
      .order('finished_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const exercises = exercisesResult.data ?? []
  const setLogs = setLogsResult.data ?? []
  const dayName = dayResult.data?.name ?? 'Entreno de hoy'

  const lastSetLogsResult = lastSessionResult.data
    ? await supabase
        .from('set_logs')
        .select('exercise_id, set_number, weight_kg, reps')
        .eq('session_id', lastSessionResult.data.id)
    : null
  const lastSetLogs = lastSetLogsResult?.data ?? []

  const exercisesWithSets = exercises.map((ex) => ({
    ...ex,
    set_logs: setLogs.filter((log) => log.exercise_id === ex.id),
  }))

  const completedCount = exercisesWithSets.filter(
    (ex) => ex.set_logs.filter((l) => l.completed).length >= ex.target_sets
  ).length

  const finishAction = finishWorkout.bind(null, session.id)

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-32">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              {dateLabel}
            </p>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--warning)] font-medium">
                <Flame className="w-3.5 h-3.5" />
                Racha {streak} {streak === 1 ? 'día' : 'días'}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{dayName}</h1>

          {/* Barra de progreso */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                style={{
                  width: `${exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-sm text-[var(--text-secondary)] font-medium whitespace-nowrap">
              {completedCount}/{exercises.length} ejercicios
            </span>
          </div>
        </div>

        {/* Ejercicios */}
        <div className="space-y-3 stagger">
          {exercisesWithSets.map((exercise, i) => (
            <div
              key={exercise.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ExerciseCard exercise={exercise} sessionId={session.id} lastSetLogs={lastSetLogs} />
            </div>
          ))}
        </div>

        {/* Finalizar */}
        <div className="mt-6">
          <form action={finishAction}>
            <Button type="submit" className="w-full" size="lg">
              <CheckCircle2 className="w-5 h-5" />
              Finalizar entrenamiento
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
