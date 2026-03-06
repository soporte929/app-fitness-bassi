'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

type SetLogInsert = Database['public']['Tables']['set_logs']['Insert']

export async function saveSetLog({
  sessionId,
  exerciseId,
  setNumber,
  weightKg,
  reps,
  rir,
  completed = true,
}: {
  sessionId: string
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  rir: number
  completed?: boolean
}): Promise<{ success: boolean }> {
  const supabase = await createClient()

  const { error } = await supabase.from('set_logs').upsert(
    {
      session_id: sessionId,
      exercise_id: exerciseId,
      set_number: setNumber,
      weight_kg: weightKg,
      reps,
      rir,
      completed,
    } satisfies SetLogInsert,
    { onConflict: 'session_id,exercise_id,set_number' }
  )

  console.log('saveSetLog error:', JSON.stringify(error))
  return { success: !error }
}

export async function finishWorkout(sessionId: string, _formData?: FormData): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workout_sessions')
    .update({ completed: true, finished_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (!error) {
    redirect('/history')
  }
}
