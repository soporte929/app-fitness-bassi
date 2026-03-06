'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert']
type SetLogInsert = Database['public']['Tables']['set_logs']['Insert']

export async function startWorkoutSession(dayId: string): Promise<void> {
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

  // If there's already any active session today, go to /today
  const { data: existing } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('client_id', client.id)
    .eq('completed', false)
    .gte('started_at', todayStart)
    .lte('started_at', todayEnd)
    .maybeSingle()

  if (existing) redirect('/today')

  // Create new session
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      client_id: client.id,
      day_id: dayId,
      started_at: now.toISOString(),
      completed: false,
    } satisfies WorkoutSessionInsert)
    .select('id')
    .single()

  if (sessionError || !session) redirect('/today')

  // Pre-populate set_logs for each exercise
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, target_sets, target_rir')
    .eq('day_id', dayId)
    .order('order_index')

  if (exercises && exercises.length > 0) {
    const setLogs: SetLogInsert[] = exercises.flatMap((ex) =>
      Array.from({ length: ex.target_sets }, (_, i) => ({
        session_id: session.id,
        exercise_id: ex.id,
        set_number: i + 1,
        weight_kg: 0,
        reps: 0,
        rir: ex.target_rir,
        completed: false,
      }))
    )
    await supabase.from('set_logs').insert(setLogs)
  }

  redirect('/today')
}
