'use client'

export type SetLogWithExercise = {
  id: string
  exercise_id: string
  set_number: number
  weight_kg: number
  reps: number
  exercise: { name: string } | null
}

export type SessionData = {
  id: string
  started_at: string
  finished_at: string | null
  workout_day: { name: string } | null
  set_logs: SetLogWithExercise[]
}

type ExerciseSummary = {
  name: string
  sets: number
  maxWeight: number
}

function groupByExercise(setLogs: SetLogWithExercise[]): ExerciseSummary[] {
  const map = new Map<string, ExerciseSummary>()
  for (const log of setLogs) {
    const name = log.exercise?.name ?? 'Ejercicio'
    const entry = map.get(name)
    if (!entry) {
      map.set(name, { name, sets: 1, maxWeight: log.weight_kg })
    } else {
      entry.sets++
      if (log.weight_kg > entry.maxWeight) entry.maxWeight = log.weight_kg
    }
  }
  return Array.from(map.values())
}

function calcVolume(setLogs: SetLogWithExercise[]): number {
  return setLogs.reduce((sum, log) => sum + log.weight_kg * log.reps, 0)
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return ''
  const diff = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

interface Props {
  session: SessionData
  index: number
}

export function SessionHistoryCard({ session, index }: Props) {
  const exercises = groupByExercise(session.set_logs)
  const volume = calcVolume(session.set_logs)
  const duration = formatDuration(session.started_at, session.finished_at)
  const dateLabel = formatDate(session.finished_at ?? session.started_at)

  return (
    <div
      className="animate-fade-in bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all duration-300 hover:border-[var(--border-hover)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-[var(--text-secondary)] capitalize">{dateLabel}</p>
          {duration && <p className="text-xs text-[var(--text-muted)]">{duration}</p>}
        </div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] leading-tight text-lg">
          {session.workout_day?.name ?? 'Entrenamiento'}
        </h2>
      </div>

      {/* Exercise list */}
      {exercises.length > 0 && (
        <div className="px-5 py-3 border-t border-[var(--border)] space-y-1.5">
          {exercises.map((ex) => (
            <div key={ex.name} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)] truncate flex-1 mr-3">{ex.name}</span>
              <span className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap font-[family-name:var(--font-geist-mono)]">
                {ex.sets}×{ex.maxWeight === 0 ? 'PC' : `${ex.maxWeight}kg`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer: total volume */}
      <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Volumen total
        </span>
        <span className="text-sm font-bold text-[var(--accent)] font-[family-name:var(--font-geist-mono)]">
          {volume.toLocaleString('es-ES')} kg
        </span>
      </div>
    </div>
  )
}
