import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { SessionDetail, type SessionDetailViewModel } from '@/components/client/session-detail'
import { detectSessionPRs } from '@/lib/pr-detection'

type SessionQuerySetLog = {
  id: string
  exercise_id: string
  set_number: number
  weight_kg: number
  reps: number
  rir: number
  completed: boolean
  exercise: {
    id: string
    name: string
    muscle_group: string
    target_sets: number
    target_reps: string
    target_rir: number
  } | null
}

type SessionQueryRow = {
  id: string
  client_id: string
  day_id: string
  completed: boolean
  started_at: string
  finished_at: string | null
  workout_day: {
    id: string
    name: string
    plan_id: string
    workout_plan: {
      id: string
      name: string
      client_id: string
    } | null
  } | null
  set_logs: SessionQuerySetLog[] | null
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return '—'

  const diffMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  const minutes = Math.max(0, Math.round(diffMs / 60000))

  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}

function formatLongDate(dateIso: string): string {
  const label = new Date(dateIso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

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

  const { data: rawSession } = await supabase
    .from('workout_sessions')
    .select(
      `id, client_id, day_id, completed, started_at, finished_at,
      workout_day:workout_days!workout_sessions_day_id_fkey (
        id, name, plan_id,
        workout_plan:workout_plans!workout_days_plan_id_fkey (id, name, client_id)
      ),
      set_logs (
        id, exercise_id, set_number, weight_kg, reps, rir, completed,
        exercise:exercises!set_logs_exercise_id_fkey (
          id, name, muscle_group, target_sets, target_reps, target_rir
        )
      )`
    )
    .eq('id', sessionId)
    .maybeSingle()

  const session = rawSession as unknown as SessionQueryRow | null

  if (!session) redirect('/history')
  if (session.client_id !== client.id) redirect('/history')

  const planClientId = session.workout_day?.workout_plan?.client_id
  if (planClientId && planClientId !== client.id) redirect('/history')

  const sortedSetLogs = [...(session.set_logs ?? [])].sort((a, b) => {
    const byExerciseId = a.exercise_id.localeCompare(b.exercise_id)
    if (byExerciseId !== 0) return byExerciseId
    return a.set_number - b.set_number
  })

  const groupedByExercise = new Map<string, SessionDetailViewModel['exercises'][number]>()

  for (const log of sortedSetLogs) {
    const existing = groupedByExercise.get(log.exercise_id)
    if (!existing) {
      const setVolume = log.weight_kg * log.reps
      groupedByExercise.set(log.exercise_id, {
        exerciseId: log.exercise_id,
        name: log.exercise?.name ?? 'Ejercicio',
        muscleGroup: log.exercise?.muscle_group ?? 'Sin grupo',
        targetSets: log.exercise?.target_sets ?? 0,
        targetReps: log.exercise?.target_reps ?? '—',
        targetRir: log.exercise?.target_rir ?? 0,
        volume: setVolume,
        bestSet: {
          weightKg: log.weight_kg,
          reps: log.reps,
          volume: setVolume,
        },
        sets: [
          {
            id: log.id,
            setNumber: log.set_number,
            weightKg: log.weight_kg,
            reps: log.reps,
            rir: log.rir,
            completed: log.completed,
          },
        ],
      })
      continue
    }

    const setVolume = log.weight_kg * log.reps
    existing.sets.push({
      id: log.id,
      setNumber: log.set_number,
      weightKg: log.weight_kg,
      reps: log.reps,
      rir: log.rir,
      completed: log.completed,
    })
    existing.volume += setVolume

    if (!existing.bestSet || setVolume > existing.bestSet.volume) {
      existing.bestSet = {
        weightKg: log.weight_kg,
        reps: log.reps,
        volume: setVolume,
      }
    }
  }

  const exercises = Array.from(groupedByExercise.values())

  const prExerciseIds = await detectSessionPRs(
    supabase,
    client.id,
    session.id,
    exercises.map((e) => e.exerciseId)
  )

  const exercisesWithPR = exercises.map((ex) => ({
    ...ex,
    isPR: prExerciseIds.has(ex.exerciseId),
  }))

  const totalVolume = sortedSetLogs.reduce((sum, log) => sum + log.weight_kg * log.reps, 0)
  const completedSets = sortedSetLogs.filter((log) => log.completed).length
  const trainedMuscles = Array.from(
    new Set(
      sortedSetLogs
        .filter((log) => log.completed)
        .map((log) => log.exercise?.muscle_group?.trim())
        .filter((muscle): muscle is string => Boolean(muscle))
    )
  )

  const sessionViewModel: SessionDetailViewModel = {
    sessionId: session.id,
    dateLabel: formatLongDate(session.finished_at ?? session.started_at),
    planName: session.workout_day?.workout_plan?.name ?? 'Plan',
    dayName: session.workout_day?.name ?? 'Entrenamiento',
    durationLabel: formatDuration(session.started_at, session.finished_at),
    totalVolume,
    exerciseCount: exercisesWithPR.length,
    completedSets,
    totalSets: sortedSetLogs.length,
    trainedMuscles,
    exercises: exercisesWithPR,
  }

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <SessionDetail session={sessionViewModel} />
      </div>
    </PageTransition>
  )
}
