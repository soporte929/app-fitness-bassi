import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { ProgressCharts } from '@/components/client/progress-charts'
import { LogWeightModal } from '@/components/client/progress/LogWeightModal'
import { LogMeasurementsModal } from '@/components/client/progress/LogMeasurementsModal'
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

  const [measurementsResult, sessionsResult] = await Promise.all([
    supabase
      .from('client_measurements')
      .select('measured_at, weight_kg, body_fat_pct, waist_cm, hip_cm, chest_cm, arm_cm, thigh_cm')
      .eq('client_id', client.id)
      .order('measured_at', { ascending: true }),

    supabase
      .from('workout_sessions')
      .select(
        `id, started_at, finished_at, completed,
        set_logs!set_logs_session_id_fkey (
          id, weight_kg, reps,
          exercise:exercises!set_logs_exercise_id_fkey (id, name)
        )`
      )
      .eq('client_id', client.id)
      .order('started_at', { ascending: true }),
  ])

  if (measurementsResult.error || sessionsResult.error) {
    const errorMsg = measurementsResult.error?.message ?? sessionsResult.error?.message
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-24">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-5">Progreso</h1>
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 p-4 text-center">
            <p className="text-sm font-medium text-[var(--danger)] mb-1">Error cargando datos</p>
            <p className="text-xs text-[var(--text-secondary)]">{errorMsg}</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  const rawMeasurements = measurementsResult.data ?? []

  const weightLogs = rawMeasurements
    .filter((m) => m.weight_kg !== null)
    .map((m) => ({
      weight_kg: m.weight_kg!,
      body_fat_pct: m.body_fat_pct,
      logged_at: m.measured_at,
    })) as WeightLog[]

  const measurements = rawMeasurements
    .filter((m) => m.waist_cm !== null || m.hip_cm !== null || m.chest_cm !== null || m.arm_cm !== null || m.thigh_cm !== null)
    .map((m) => ({
      ...m,
      measured_at: m.measured_at,
    })) as Measurement[]

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <div className="flex items-center justify-between mb-5 items-end">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Progreso</h1>
          <div className="flex gap-2 items-center">
            <LogMeasurementsModal clientId={client.id} />
            <LogWeightModal clientId={client.id} />
          </div>
        </div>

        <ProgressCharts
          weightLogs={weightLogs}
          measurements={measurements}
          sessions={(sessionsResult.data ?? []) as unknown as SessionForProgress[]}
          targetWeightKg={client.target_weight_kg}
          nowIso={new Date().toISOString()}
        />
      </div>
    </PageTransition>
  )
}
