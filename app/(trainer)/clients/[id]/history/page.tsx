import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { HistoryFilters } from '@/components/client/history-filters'
import type { SessionData } from '@/components/client/session-history-card'
import { ArrowLeft, History } from 'lucide-react'

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

export default async function TrainerClientHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que el cliente pertenece a este trainer
  const { data: client } = await supabase
    .from('clients')
    .select('id, profile:profiles!clients_profile_id_fkey (full_name)')
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!client) notFound()

  const profile = client.profile as { full_name: string } | null
  const clientName = profile?.full_name ?? 'Cliente'

  // Fetch sesiones completadas del cliente
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

  const sessions: SessionData[] = sessionsFromDb.map((session) => {
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
    }
  })

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8">
        {/* Back link */}
        <Link
          href={`/clients/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a {clientName}
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Historial de {clientName}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {sessions.length}{' '}
            {sessions.length === 1 ? 'entrenamiento completado' : 'entrenamientos completados'}
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="w-12 h-12 text-[var(--text-muted)] mb-3" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Sin entrenamientos</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {clientName} aún no ha completado ningún entrenamiento
            </p>
          </div>
        ) : (
          <HistoryFilters sessions={sessions} />
        )}
      </div>
    </PageTransition>
  )
}
