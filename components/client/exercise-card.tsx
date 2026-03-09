'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, CheckCircle2, ChevronDown, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveSetLog } from '@/app/(client)/today/actions'
import type { Database } from '@/lib/supabase/types'

type ExerciseRow = Database['public']['Tables']['exercises']['Row']
type SetLogRow = Database['public']['Tables']['set_logs']['Row']

export type ExerciseWithSets = Pick<
  ExerciseRow,
  'id' | 'name' | 'muscle_group' | 'target_sets' | 'target_reps' | 'target_rir'
> & {
  set_logs: Pick<
    SetLogRow,
    'id' | 'exercise_id' | 'set_number' | 'weight_kg' | 'reps' | 'rir' | 'completed'
  >[]
  isPR?: boolean          // keep for backward compat (static override)
  prBestVolume?: number   // all-time best weight_kg * reps from prior sessions (0 if no prior)
}

export type LastSetLog = {
  exercise_id: string
  set_number: number
  weight_kg: number
  reps: number
}

type SetState = {
  weight: string
  reps: string
  rir: string
  done: boolean
}

const inputClass =
  'w-full h-10 px-1 rounded-lg text-sm text-center border transition-all focus:outline-none bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)]'

export function ExerciseCard({
  exercise,
  sessionId,
  lastSetLogs = [],
  onSetCountChange,
}: {
  exercise: ExerciseWithSets
  sessionId: string
  lastSetLogs?: LastSetLog[]
  onSetCountChange?: (exerciseId: string, completedSets: number) => void
}) {
  const myLastLogs = lastSetLogs.filter((l) => l.exercise_id === exercise.id)

  const initialSets: SetState[] = Array.from({ length: exercise.target_sets }, (_, i) => {
    const existing = exercise.set_logs.find((l) => l.set_number === i + 1)
    if (existing && existing.completed) {
      return {
        weight: String(existing.weight_kg),
        reps: String(existing.reps),
        rir: String(existing.rir),
        done: true,
      }
    }
    const prev = myLastLogs.find((l) => l.set_number === i + 1)
    return {
      weight: prev ? String(prev.weight_kg) : '',
      reps: prev ? String(prev.reps) : '',
      rir: String(exercise.target_rir),
      done: false,
    }
  })

  const [sets, setSets] = useState<SetState[]>(initialSets)
  const [expanded, setExpanded] = useState(true)
  const [isPending, startTransition] = useTransition()

  const isPR = exercise.prBestVolume !== undefined
    ? sets.some((s) => {
        if (!s.done) return false
        const vol = (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)
        return vol > 0 && vol > exercise.prBestVolume!
      })
    : (exercise.isPR ?? false) // fallback to static prop if prBestVolume not provided
  const [savingIdx, setSavingIdx] = useState<number | null>(null)

  const completedSets = sets.filter((s) => s.done).length

  useEffect(() => {
    onSetCountChange?.(exercise.id, completedSets)
  }, [completedSets, exercise.id, onSetCountChange])

  const updateSet = (i: number, field: 'weight' | 'reps' | 'rir', value: string) => {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
    // Re-save if this set is already completed
    const currentSet = sets[i]
    if (currentSet?.done) {
      const updatedSet = { ...currentSet, [field]: value }
      setSavingIdx(i)
      startTransition(async () => {
        const result = await saveSetLog({
          sessionId,
          exerciseId: exercise.id,
          setNumber: i + 1,
          weightKg: parseFloat(updatedSet.weight) || 0,
          reps: parseInt(updatedSet.reps) || 0,
          rir: parseInt(updatedSet.rir) || 0,
          completed: true,
        })
        setSavingIdx(null)
      })
    }
  }

  // Toggle: completes if not done, uncompletes if done
  const handleComplete = (i: number) => {
    const set = sets[i]
    if (!set) return
    const newCompleted = !set.done
    setSavingIdx(i)
    startTransition(async () => {
      if (newCompleted) {
        // Mark series i + any previous undone series
        const toMark = sets
          .map((s, idx) => ({ s, idx }))
          .filter(({ s, idx }) => idx < i && !s.done)
          .concat([{ s: set, idx: i }])

        await Promise.all(
          toMark.map(({ s, idx }) =>
            saveSetLog({
              sessionId,
              exerciseId: exercise.id,
              setNumber: idx + 1,
              weightKg: parseFloat(s.weight) || 0,
              reps: parseInt(s.reps) || 0,
              rir: parseInt(s.rir) || 0,
              completed: true,
            })
          )
        )
        setSavingIdx(null)
        setSets((prev) =>
          prev.map((s, idx) => (idx <= i ? { ...s, done: true } : s))
        )
      } else {
        // Unmark series i + all subsequent done series
        const toUnmark = sets
          .map((s, idx) => ({ s, idx }))
          .filter(({ s, idx }) => idx >= i && s.done)

        await Promise.all(
          toUnmark.map(({ s, idx }) =>
            saveSetLog({
              sessionId,
              exerciseId: exercise.id,
              setNumber: idx + 1,
              weightKg: parseFloat(s.weight) || 0,
              reps: parseInt(s.reps) || 0,
              rir: parseInt(s.rir) || 0,
              completed: false,
            })
          )
        )
        setSavingIdx(null)
        setSets((prev) =>
          prev.map((s, idx) => (idx >= i ? { ...s, done: false } : s))
        )
      }
      if (newCompleted) {
        window.dispatchEvent(new CustomEvent('startRestTimer', { detail: { seconds: 180 } }))
      }
    })
  }

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div
          className={cn(
            'flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
            completedSets === sets.length && sets.length > 0
              ? 'bg-[var(--success)]/15 text-[var(--success)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
          )}
        >
          {completedSets === sets.length && sets.length > 0 && <Check className="w-3 h-3" />}
          {completedSets}/{sets.length}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{exercise.name}</p>
            {isPR && (
              <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-[var(--warning)] bg-[var(--warning)]/10 px-1.5 py-0.5 rounded-full">
                <Trophy className="w-2.5 h-2.5" /> PR
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {exercise.muscle_group} · {exercise.target_reps} reps · RIR {exercise.target_rir}
          </p>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)]">
          {/* Table header */}
          <div className="grid grid-cols-[28px_60px_1fr_1fr_46px_40px] gap-x-2 px-4 py-2 bg-[var(--bg-elevated)]">
            {['#', 'ANT.', 'KG', 'REPS', 'RIR', ''].map((h) => (
              <p key={h} className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide text-center">
                {h}
              </p>
            ))}
          </div>

          {sets.map((set, i) => {
            const prev = myLastLogs.find((l) => l.set_number === i + 1)
            const isSaving = savingIdx === i && isPending
            return (
              <div
                key={i}
                className={cn(
                  'grid grid-cols-[28px_60px_1fr_1fr_46px_40px] gap-x-2 items-center px-4 py-2 border-t border-[var(--border)]',
                  set.done && 'bg-[var(--success)]/5'
                )}
              >
                {/* # */}
                <div className="flex items-center justify-center">
                  {set.done ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <span className="text-sm text-[var(--text-muted)] font-medium">{i + 1}</span>
                  )}
                </div>

                {/* ANT. */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-[var(--text-muted)]">
                    {prev ? `${prev.weight_kg}×${prev.reps}` : '—'}
                  </span>
                </div>

                {/* KG */}
                <input
                  type="number"
                  inputMode="decimal"
                  value={set.weight}
                  onChange={(e) => updateSet(i, 'weight', e.target.value)}
                  placeholder={prev ? String(prev.weight_kg) : '—'}
                  className={inputClass}
                />

                {/* REPS */}
                <input
                  type="number"
                  inputMode="numeric"
                  value={set.reps}
                  onChange={(e) => updateSet(i, 'reps', e.target.value)}
                  placeholder={prev ? String(prev.reps) : '—'}
                  className={inputClass}
                />

                {/* RIR */}
                <input
                  type="number"
                  inputMode="numeric"
                  value={set.rir}
                  onChange={(e) => updateSet(i, 'rir', e.target.value)}
                  placeholder="—"
                  className={inputClass}
                />

                {/* ✓ toggle */}
                <button
                  type="button"
                  onClick={() => handleComplete(i)}
                  disabled={isSaving}
                  className={cn(
                    'w-full h-10 rounded-lg flex items-center justify-center transition-all',
                    set.done
                      ? 'bg-[var(--success)]/15 text-[var(--success)] hover:bg-[var(--success)]/25 active:scale-95'
                      : isSaving
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-wait'
                        : 'bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 active:scale-95'
                  )}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
