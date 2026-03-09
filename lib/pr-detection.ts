import type { SupabaseClient } from '@supabase/supabase-js'

type SetLogWithSession = {
  exercise_id: string
  weight_kg: number
  reps: number
  workout_session: {
    client_id: string
    completed: boolean
  } | null
}

/**
 * Computes the all-time best volume (weight_kg * reps) per exercise for a client.
 * Returns a Map<exerciseId, bestVolume>.
 */
export async function computePRBestsByClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from('set_logs')
    .select(`
      exercise_id,
      weight_kg,
      reps,
      completed,
      workout_session:workout_sessions!set_logs_session_id_fkey (
        client_id,
        completed
      )
    `)
    .eq('completed', true)

  const rows = (data ?? []) as unknown as Array<SetLogWithSession & { completed: boolean }>

  const bestByExercise = new Map<string, number>()

  for (const row of rows) {
    const session = row.workout_session
    if (!session || session.client_id !== clientId || !session.completed) continue

    const volume = row.weight_kg * row.reps
    const current = bestByExercise.get(row.exercise_id) ?? 0
    if (volume > current) {
      bestByExercise.set(row.exercise_id, volume)
    }
  }

  return bestByExercise
}

/**
 * For a specific session, determines which exercises achieved a personal record
 * compared to ALL OTHER completed sessions (excluding the current session).
 * Returns a Set<exerciseId> of exercises that set a PR in this session.
 */
export async function detectSessionPRs(
  supabase: SupabaseClient,
  clientId: string,
  sessionId: string,
  exerciseIds: string[]
): Promise<Set<string>> {
  if (exerciseIds.length === 0) return new Set()

  // Step 1: Get best volume per exercise for the current session
  const { data: currentLogsData } = await supabase
    .from('set_logs')
    .select('exercise_id, weight_kg, reps')
    .eq('session_id', sessionId)
    .eq('completed', true)
    .in('exercise_id', exerciseIds)

  const currentLogs = (currentLogsData ?? []) as Array<{
    exercise_id: string
    weight_kg: number
    reps: number
  }>

  const currentBest = new Map<string, number>()
  for (const log of currentLogs) {
    const volume = log.weight_kg * log.reps
    const existing = currentBest.get(log.exercise_id) ?? 0
    if (volume > existing) {
      currentBest.set(log.exercise_id, volume)
    }
  }

  // Step 2: Get best volume per exercise from prior sessions (excluding current)
  const { data: priorLogsData } = await supabase
    .from('set_logs')
    .select(`
      exercise_id, weight_kg, reps,
      workout_session:workout_sessions!set_logs_session_id_fkey (client_id, completed)
    `)
    .eq('completed', true)
    .neq('session_id', sessionId)
    .in('exercise_id', exerciseIds)

  const priorLogs = (priorLogsData ?? []) as unknown as Array<SetLogWithSession>

  const priorBest = new Map<string, number>()
  for (const log of priorLogs) {
    const session = log.workout_session
    if (!session || session.client_id !== clientId || !session.completed) continue

    const volume = log.weight_kg * log.reps
    const existing = priorBest.get(log.exercise_id) ?? 0
    if (volume > existing) {
      priorBest.set(log.exercise_id, volume)
    }
  }

  // Step 3: Compare current session best vs prior best
  const prExercises = new Set<string>()
  for (const [exerciseId, currentVolume] of currentBest.entries()) {
    const historical = priorBest.get(exerciseId) ?? 0
    if (currentVolume > historical) {
      prExercises.add(exerciseId)
    }
  }

  return prExercises
}
