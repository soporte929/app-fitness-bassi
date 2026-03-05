import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { HistoryFilters } from '@/components/client/history-filters'
import type { SessionData } from '@/components/client/session-history-card'
import { History } from 'lucide-react'

export default async function HistoryPage() {
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

  const { data: rawSessions } = await supabase
    .from('workout_sessions')
    .select(
      `id, started_at, finished_at,
      workout_day:workout_days!workout_sessions_day_id_fkey (name),
      set_logs (
        id, exercise_id, set_number, weight_kg, reps,
        exercise:exercises!set_logs_exercise_id_fkey (name)
      )`
    )
    .eq('client_id', client.id)
    .eq('completed', true)
    .order('finished_at', { ascending: false })

  const sessions = (rawSessions ?? []) as unknown as SessionData[]

  if (sessions.length === 0) {
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <History className="w-16 h-16 text-[var(--text-muted)] mb-4" />
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Sin entrenamientos completados
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Completa tu primer entrenamiento para verlo aquí
          </p>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Historial</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {sessions.length} {sessions.length === 1 ? 'entrenamiento' : 'entrenamientos'}
          </p>
        </div>

        <HistoryFilters sessions={sessions} />
      </div>
    </PageTransition>
  )
}
