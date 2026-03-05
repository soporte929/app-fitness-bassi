'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Trophy } from 'lucide-react'
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
  isPR?: boolean
}

type SetState = {
  weight: string
  reps: string
  rir: string
  done: boolean
}

export function ExerciseCard({
  exercise,
  sessionId,
}: {
  exercise: ExerciseWithSets
  sessionId: string
}) {
  const initialSets: SetState[] = Array.from({ length: exercise.target_sets }, (_, i) => {
    const existing = exercise.set_logs.find((l) => l.set_number === i + 1)
    if (existing) {
      return {
        weight: String(existing.weight_kg),
        reps: String(existing.reps),
        rir: String(existing.rir),
        done: existing.completed,
      }
    }
    return { weight: '', reps: '', rir: '', done: false }
  })

  const [sets, setSets] = useState<SetState[]>(initialSets)
  const [expanded, setExpanded] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)

  const completedSets = sets.filter((s) => s.done).length

  const updateSet = (i: number, field: 'weight' | 'reps' | 'rir', value: string) => {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  const handleBlur = async (i: number) => {
    const set = sets[i]
    if (!set.done && set.weight && set.reps && set.rir !== '') {
      setSaving(i)
      const result = await saveSetLog({
        sessionId,
        exerciseId: exercise.id,
        setNumber: i + 1,
        weightKg: parseFloat(set.weight),
        reps: parseInt(set.reps),
        rir: parseInt(set.rir),
      })
      setSaving(null)
      if (result.success) {
        setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, done: true } : s)))
      }
    }
  }

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
              completedSets === sets.length
                ? 'bg-[var(--success)]/15 text-[var(--success)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
            )}
          >
            {completedSets}/{sets.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{exercise.name}</p>
              {exercise.isPR && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[var(--warning)] bg-[var(--warning)]/10 px-1.5 py-0.5 rounded-full">
                  <Trophy className="w-2.5 h-2.5" /> PR
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {exercise.muscle_group} · {exercise.target_reps} reps · RIR {exercise.target_rir}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)]">
          <div className="grid grid-cols-4 gap-2 px-5 py-2 bg-[var(--bg-elevated)]">
            {['Serie', 'Peso (kg)', 'Reps', 'RIR'].map((h) => (
              <p key={h} className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                {h}
              </p>
            ))}
          </div>

          {sets.map((set, i) => (
            <div
              key={i}
              className={cn(
                'grid grid-cols-4 gap-2 items-center px-5 min-h-[52px] border-t border-[var(--border)]',
                set.done && 'bg-[var(--success)]/5'
              )}
            >
              <div className="flex items-center gap-2">
                {set.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                ) : saving === i ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--text-muted)]" />
                )}
                <span className="text-sm text-[var(--text-secondary)]">{i + 1}</span>
              </div>

              <input
                type="number"
                inputMode="decimal"
                value={set.weight}
                onChange={(e) => updateSet(i, 'weight', e.target.value)}
                onBlur={() => handleBlur(i)}
                disabled={set.done}
                placeholder="—"
                className={cn(
                  'w-full h-12 px-2.5 rounded-lg text-base text-center border transition-all focus:outline-none',
                  set.done
                    ? 'bg-transparent border-transparent text-[var(--text-secondary)] cursor-not-allowed'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'
                )}
              />

              <input
                type="number"
                inputMode="numeric"
                value={set.reps}
                onChange={(e) => updateSet(i, 'reps', e.target.value)}
                onBlur={() => handleBlur(i)}
                disabled={set.done}
                placeholder="—"
                className={cn(
                  'w-full h-12 px-2.5 rounded-lg text-base text-center border transition-all focus:outline-none',
                  set.done
                    ? 'bg-transparent border-transparent text-[var(--text-secondary)] cursor-not-allowed'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'
                )}
              />

              <input
                type="number"
                inputMode="numeric"
                value={set.rir}
                onChange={(e) => updateSet(i, 'rir', e.target.value)}
                onBlur={() => handleBlur(i)}
                disabled={set.done}
                placeholder="—"
                className={cn(
                  'w-full h-12 px-2.5 rounded-lg text-base text-center border transition-all focus:outline-none',
                  set.done
                    ? 'bg-transparent border-transparent text-[var(--text-secondary)] cursor-not-allowed'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'
                )}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
