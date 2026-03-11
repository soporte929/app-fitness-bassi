'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export function ActiveSessionBanner() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [elapsed, setElapsed] = useState<string>('')
  const [completedSets, setCompletedSets] = useState(0)
  const [totalSets, setTotalSets] = useState(0)
  const [restSeconds, setRestSeconds] = useState(0)
  const [restActive, setRestActive] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (!clientRecord) return

      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setUTCHours(23, 59, 59, 999)

      const { data: session } = await supabase
        .from('workout_sessions')
        .select('id, started_at, day_id')
        .eq('client_id', clientRecord.id)
        .eq('completed', false)
        .gte('started_at', todayStart.toISOString())
        .lte('started_at', todayEnd.toISOString())
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!session) {
        setActiveSession(null)
        setTotalSets(0)
        setCompletedSets(0)
        return
      }

      const [dayResult, setLogsResult] = await Promise.all([
        supabase.from('workout_days').select('name').eq('id', session.day_id).single(),
        supabase.from('set_logs').select('completed').eq('session_id', session.id),
      ])

      const total = setLogsResult.data?.length ?? 0
      const completed = setLogsResult.data?.filter((s) => s.completed).length ?? 0
      setTotalSets(total)
      setCompletedSets(completed)

      setActiveSession({
        id: session.id,
        started_at: session.started_at,
        day: { name: dayResult.data?.name ?? '' },
      })
    }

    fetchSession()

    const interval = setInterval(fetchSession, 10000)
    return () => clearInterval(interval)
  }, [pathname])

  // Listen for immediate workout completion signal (dispatched by FinishWorkoutButton)
  useEffect(() => {
    function handleFinished() {
      setActiveSession(null)
      setTotalSets(0)
      setCompletedSets(0)
    }
    window.addEventListener('workoutFinished', handleFinished)
    return () => window.removeEventListener('workoutFinished', handleFinished)
  }, [])

  useEffect(() => {
    if (!activeSession) return
    setElapsed(formatElapsed(activeSession.started_at))
    const id = setInterval(() => {
      setElapsed(formatElapsed(activeSession.started_at))
    }, 1000)
    return () => clearInterval(id)
  }, [activeSession])

  useEffect(() => {
    function handleStart(e: Event) {
      const detail = (e as CustomEvent<{ seconds: number }>).detail
      setRestSeconds(detail.seconds)
      setRestActive(true)
    }
    window.addEventListener('startRestTimer', handleStart)
    return () => window.removeEventListener('startRestTimer', handleStart)
  }, [])

  useEffect(() => {
    if (!restActive) return
    const id = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          setRestActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [restActive])

  if (!activeSession || pathname === '/today' || pathname.startsWith('/workout')) return null

  return (
    <button
      type="button"
      onClick={() => router.push(`/workout/${activeSession.id}`)}
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-50 flex items-center gap-3 py-3 rounded-xl bg-[var(--bg-surface)] border border-green-500/30 shadow-lg animate-slide-up"
      style={{ bottom: '72px' }}
    >
      <span className="relative flex-shrink-0 flex items-center justify-center w-4 h-4">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40 animate-ping" />
        <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-500" />
      </span>
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
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {elapsed}
        </span>
        {restActive && (
          <span className="text-xs font-bold tabular-nums" style={{ color: '#f5c518' }}>
            {String(Math.floor(restSeconds / 60)).padStart(2, '0')}:{String(restSeconds % 60).padStart(2, '0')}
          </span>
        )}
      </div>
    </button>
  )
}
