import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { HistoryFilters } from '@/components/client/history-filters'
import type { SessionData } from '@/components/client/session-history-card'
import { detectSessionPRs } from '@/lib/pr-detection'
import { History } from 'lucide-react'

type SessionSetLogRow = {
  weight_kg: number
  reps: number
  completed: boolean
  exercises: {
    id: string
    muscle_group: string | null
  } | null
}

type SessionRow = {
  id: string
  started_at: string
  finished_at: string | null
  workout_day: {
    name: string
  } | null
  set_logs: SessionSetLogRow[] | null
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
        weight_kg, reps, completed,
        exercises (
          id,
          muscle_group
        )
      )`
    )
    .eq('client_id', client.id)
    .eq('completed', true)
    .order('finished_at', { ascending: false })

  const sessionsFromDb = (rawSessions ?? []) as SessionRow[]

  // Collect unique exercise IDs per session for PR detection
  const sessionExerciseIds = sessionsFromDb.map((session) =>
    Array.from(
      new Set(
        (session.set_logs ?? [])
          .map((l) => l.exercises?.id)
          .filter((id): id is string => Boolean(id))
      )
    )
  )

  // Detect PRs per session in parallel
  const prResults = await Promise.all(
    sessionsFromDb.map((session, i) =>
      detectSessionPRs(supabase, client.id, session.id, sessionExerciseIds[i])
    )
  )

  const sessions: SessionData[] = sessionsFromDb.map((session, i) => {
    const completedLogs = (session.set_logs ?? []).filter((log) => log.completed)
    const totalVolume = completedLogs.reduce((sum, log) => sum + log.weight_kg * log.reps, 0)
    const trainedMuscles = Array.from(
      new Set(
        completedLogs
          .map((log) => log.exercises?.muscle_group?.trim())
          .filter((muscle): muscle is string => Boolean(muscle))
      )
    )

    return {
      id: session.id,
      started_at: session.started_at,
      finished_at: session.finished_at,
      workout_day: session.workout_day,
      durationLabel: formatDuration(session.started_at, session.finished_at),
      totalVolume,
      completedSets: completedLogs.length,
      trainedMuscles,
      hasPR: prResults[i].size > 0,
    }
  })

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
