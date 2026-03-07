'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Minus, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RestTimer() {
  const pathname = usePathname()
  const [seconds, setSeconds] = useState(0)
  const [active, setActive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset timer when navigating to a different page
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setActive(false)
    setSeconds(0)
  }, [pathname])

  useEffect(() => {
    function handleStart(e: Event) {
      const detail = (e as CustomEvent<{ seconds: number }>).detail
      setSeconds(detail.seconds)
      setActive(true)
    }
    window.addEventListener('startRestTimer', handleStart)
    return () => window.removeEventListener('startRestTimer', handleStart)
  }, [])

  useEffect(() => {
    if (!active) return
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          setActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active])

  const adjust = (delta: number) => setSeconds((prev) => Math.max(0, prev + delta))

  const dismiss = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setActive(false)
    setSeconds(0)
  }

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return (
    <div
      className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-30',
        'transition-all duration-300 ease-out',
        active ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-3 opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
            Descanso
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{display}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjust(-15)}
            className="w-9 h-9 rounded-lg bg-[var(--bg-overlay)] text-[var(--text-primary)] flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => adjust(15)}
            className="w-9 h-9 rounded-lg bg-[var(--bg-overlay)] text-[var(--text-primary)] flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="w-9 h-9 rounded-lg bg-[var(--bg-overlay)] text-[var(--text-secondary)] flex items-center justify-center hover:opacity-80 transition-opacity ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
