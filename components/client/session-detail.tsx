'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export type SessionDetailSet = {
  id: string
  setNumber: number
  weightKg: number
  reps: number
  rir: number
  completed: boolean
}

export type SessionDetailBestSet = {
  weightKg: number
  reps: number
  volume: number
}

export type SessionDetailExerciseGroup = {
  exerciseId: string
  name: string
  muscleGroup: string
  targetSets: number
  targetReps: string
  targetRir: number
  volume: number
  bestSet: SessionDetailBestSet | null
  sets: SessionDetailSet[]
}

export type SessionDetailViewModel = {
  sessionId: string
  dateLabel: string
  planName: string
  dayName: string
  durationLabel: string
  totalVolume: number
  exerciseCount: number
  completedSets: number
  totalSets: number
  trainedMuscles: string[]
  exercises: SessionDetailExerciseGroup[]
}

const weightFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const volumeFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatWeight(weight: number): string {
  return weightFormatter.format(weight)
}

function formatVolume(volume: number): string {
  return `${volumeFormatter.format(volume)} kg`
}

function formatObjective(exercise: SessionDetailExerciseGroup): string {
  return `${exercise.targetSets}×${exercise.targetReps} reps · RIR ${exercise.targetRir}`
}

function formatBestSet(bestSet: SessionDetailBestSet | null): string {
  if (!bestSet) return '—'
  return `${formatWeight(bestSet.weightKg)}kg × ${bestSet.reps} reps`
}

export function SessionDetail({ session }: { session: SessionDetailViewModel }) {
  return (
    <div className="space-y-4">
      <header className="animate-fade-in">
        <Link
          href="/history"
          className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3"
        >
          ← Historial
        </Link>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{session.dateLabel}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {session.planName} · {session.dayName}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Duración</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{session.durationLabel}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Volumen</p>
            <p className="text-sm font-semibold text-[var(--accent)] mt-0.5">{formatVolume(session.totalVolume)}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Ejercicios
            </p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{session.exerciseCount}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Series</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
              {session.completedSets}/{session.totalSets}
            </p>
          </div>
        </div>

        {session.trainedMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {session.trainedMuscles.map((muscle) => (
              <span
                key={muscle}
                className="text-xs bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}
      </header>

      {session.exercises.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="py-10 px-5 text-center">
            <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Sesión sin sets registrados</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Aún no hay series guardadas para este entrenamiento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger">
          {session.exercises.map((exercise, index) => (
            <div
              key={exercise.exerciseId}
              className="animate-fade-in bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">{exercise.name}</h2>
                  <span className="text-[11px] font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {exercise.muscleGroup}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{formatObjective(exercise)}</p>
              </div>

              <div className="border-t border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider">
                        Serie
                      </th>
                      <th className="text-right px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">
                        Peso
                      </th>
                      <th className="text-right px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">
                        Reps
                      </th>
                      <th className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider">
                        RIR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set) => (
                      <tr
                        key={set.id}
                        className={`border-t border-[var(--border)] ${set.completed ? '' : 'opacity-50'}`}
                      >
                        <td className="px-5 py-2.5 text-[var(--text-primary)] font-medium">{set.setNumber}</td>
                        <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                          {formatWeight(set.weightKg)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">{set.reps}</td>
                        <td className="px-5 py-2.5 text-right text-[var(--text-primary)]">{set.rir}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[var(--border)] px-5 py-3 space-y-1.5">
                <p className="text-xs text-[var(--text-secondary)]">
                  Mejor serie:{' '}
                  <span className="font-semibold text-[var(--text-primary)]">{formatBestSet(exercise.bestSet)}</span>
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Volumen: <span className="font-semibold text-[var(--accent)]">{formatVolume(exercise.volume)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="animate-fade-in">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Volumen total
            </span>
            <span className="text-lg font-bold text-[var(--accent)]">{formatVolume(session.totalVolume)}</span>
          </div>
          <Link
            href="/progress"
            className="w-full min-h-[44px] rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold text-sm flex items-center justify-center hover:opacity-90"
          >
            Ver progreso de estos ejercicios
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
