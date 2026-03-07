'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type ActiveSession = {
  id: string
  started_at: string
  day: { name: string }
}

function formatElapsed(startedAt: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  if (h > 0) return `${h}h ${m}min ${s}s`
  return `${m}min ${s}s`
}

export function ActiveSessionBanner({
  activeSession,
  completedSets,
  totalSets,
}: {
  activeSession: ActiveSession | null
  completedSets: number
  totalSets: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [elapsed, setElapsed] = useState<string>('')

  useEffect(() => {
    if (!activeSession) return
    setElapsed(formatElapsed(activeSession.started_at))
    const id = setInterval(() => {
      setElapsed(formatElapsed(activeSession.started_at))
    }, 1000)
    return () => clearInterval(id)
  }, [activeSession])

  if (!activeSession || pathname === '/today') return null

  return (
    <button
      type="button"
      onClick={() => router.push('/today')}
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-50 flex items-center gap-3 py-3 rounded-xl bg-[var(--bg-surface)] border border-green-500/30 shadow-lg animate-slide-up"
      style={{ bottom: '72px' }}
    >
      {/* Green ping dot */}
      <span className="relative flex-shrink-0 flex items-center justify-center w-4 h-4">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40 animate-ping" />
        <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-500" />
      </span>

      {/* Text + progress */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-green-400 leading-none">
          Entrenamiento activo
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
          {activeSession.day.name}
        </p>
        {totalSets > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedSets / totalSets) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
              {completedSets}/{totalSets} series
            </span>
          </div>
        )}
      </div>

      {/* Duration */}
      <span className="flex-shrink-0 text-xs font-medium text-[var(--text-secondary)]">
        {elapsed}
      </span>
    </button>
  )
}
