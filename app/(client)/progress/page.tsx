import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { ProgressCharts } from '@/components/client/progress-charts'
import type { WeightLog, Measurement, SessionForProgress } from '@/components/client/progress-charts'

export default async function ProgressPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, target_weight_kg')
    .eq('profile_id', user.id)
    .single()

  if (!client) redirect('/login')

  const [weightResult, measurementsResult, sessionsResult] = await Promise.all([
    supabase
      .from('weight_logs')
      .select('weight_kg, body_fat_pct, logged_at')
      .eq('client_id', client.id)
      .order('logged_at', { ascending: true }),

    supabase
      .from('measurements')
      .select('waist_cm, hip_cm, chest_cm, arm_cm, thigh_cm, measured_at')
      .eq('client_id', client.id)
      .order('measured_at', { ascending: true }),

    supabase
      .from('workout_sessions')
      .select(
        `id, finished_at,
        set_logs (
          weight_kg, reps,
          exercise:exercises!set_logs_exercise_id_fkey (id, name)
        )`
      )
      .eq('client_id', client.id)
      .eq('completed', true)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: true }),
  ])

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-5">Progreso</h1>
        <ProgressCharts
          weightLogs={(weightResult.data ?? []) as WeightLog[]}
          measurements={(measurementsResult.data ?? []) as Measurement[]}
          sessions={(sessionsResult.data ?? []) as unknown as SessionForProgress[]}
          targetWeightKg={client.target_weight_kg}
        />
      </div>
    </PageTransition>
  )
}
