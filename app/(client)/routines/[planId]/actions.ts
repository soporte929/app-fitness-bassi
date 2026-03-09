'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert']
type SetLogInsert = Database['public']['Tables']['set_logs']['Insert']

export async function startWorkoutSession(dayId: string, _formData?: FormData): Promise<void> {
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

  // Global collision check: if ANY incomplete session exists (across all days, any date),
  // redirect to it. Per CONTEXT.md decision: one active session at a time, finish before starting new.
  // NOTE: routines/[planId]/page.tsx shows "Reanudar entreno" using a today-scoped hasActiveSession
  // check — that label may be stale for multi-day-old sessions, but the action is authoritative:
  // it always finds and redirects to the real active session regardless of date.
  const { data: existing } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('client_id', client.id)
    .eq('completed', false)
    .maybeSingle()

  if (existing) redirect(`/workout/${existing.id}`)

  // Create new session
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      client_id: client.id,
      day_id: dayId,
      started_at: new Date().toISOString(),
      completed: false,
    } satisfies WorkoutSessionInsert)
    .select('id')
    .single()

  if (sessionError || !session) redirect('/routines')

  // Pre-populate set_logs for each exercise so ExerciseCard has rows to upsert against.
  // Without these rows, the upsert in saveSetLog would insert duplicates on repeat visits.
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

  redirect(`/workout/${session.id}`)
}
