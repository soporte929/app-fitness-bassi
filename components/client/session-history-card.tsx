'use client'

import Link from 'next/link'
import { Trophy } from 'lucide-react'

export type SessionData = {
  id: string
  started_at: string
  finished_at: string | null
  workout_day: { name: string } | null
  durationLabel: string
  totalVolume: number
  completedSets: number
  trainedMuscles: string[]
  hasPR?: boolean
}

const volumeFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatVolume(volume: number): string {
  return `${volumeFormatter.format(volume)} kg`
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
  const dateLabel = formatDate(session.finished_at ?? session.started_at)
  const dayName = session.workout_day?.name ?? 'Entrenamiento'
  const detailsHref = `/history/${session.id}`
  const setLabel = `${session.completedSets} ${session.completedSets === 1 ? 'serie' : 'series'}`

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
      <Link
        href={detailsHref}
        aria-label={`Ver detalle de sesión: ${dayName}, ${dateLabel}`}
        className="block bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all duration-300 hover:border-[var(--border-hover)] cursor-pointer"
      >
        <div className="px-5 pt-4 pb-3">
          <p className="text-xs font-medium text-[var(--text-secondary)] capitalize mb-1">{dateLabel}</p>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-tight text-lg">{dayName}</h2>
            {session.hasPR && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[var(--warning)] bg-[var(--warning)]/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                <Trophy className="w-2.5 h-2.5" /> PR
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[var(--border)] space-y-2">
          <p className="text-sm text-[var(--text-primary)] font-medium font-[family-name:var(--font-geist-mono)]">
            {formatVolume(session.totalVolume)} · {setLabel} · {session.durationLabel}
          </p>

          {session.trainedMuscles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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
        </div>
      </Link>
    </div>
  )
}
