'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { SessionHistoryCard } from './session-history-card'
import type { SessionData } from './session-history-card'
import { History } from 'lucide-react'

type Filter = 'all' | 'week' | 'month'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
]

function getWeekStart(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const day = now.getDay() // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day // back to Monday
  now.setDate(now.getDate() + diff)
  return now
}

function getMonthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

interface Props {
  sessions: SessionData[]
}

export function HistoryFilters({ sessions }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return sessions
    const cutoff = filter === 'week' ? getWeekStart() : getMonthStart()
    return sessions.filter((s) => {
      const date = new Date(s.finished_at ?? s.started_at)
      return date >= cutoff
    })
  }, [filter, sessions])

  return (
    <>
      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              filter === f.id
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <History className="w-12 h-12 text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Sin entrenamientos en este período
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Prueba con un rango más amplio</p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {filtered.map((session, i) => (
            <SessionHistoryCard key={session.id} session={session} index={i} />
          ))}
        </div>
      )}
    </>
  )
}
