'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/types'

type ExerciseRow = Database['public']['Tables']['exercises']['Row']

export type DayWithExercises = {
  id: string
  name: string
  order_index: number
  exercises: Pick<
    ExerciseRow,
    'id' | 'name' | 'muscle_group' | 'target_sets' | 'target_reps' | 'target_rir' | 'order_index' | 'notes'
  >[]
}

export function PlanDayCard({ day, index }: { day: DayWithExercises; index: number }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="bg-[var(--bg-surface)] rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-4 flex items-center justify-between text-left min-h-[56px]"
        >
          <div>
            <p className="text-base font-semibold text-[var(--text-primary)]">{day.name}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {day.exercises.length} {day.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          )}
        </button>

        {expanded && day.exercises.length > 0 && (
          <div className="border-t border-[var(--border)]">
            {day.exercises.map((ex, i) => (
              <div
                key={ex.id}
                className={cn(
                  'px-5 py-3.5 min-h-[60px] flex flex-col justify-center',
                  i > 0 && 'border-t border-[var(--border)]'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)] flex-1 min-w-0 truncate">
                    {ex.name}
                  </p>
                  <span className="flex-shrink-0 text-[11px] font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">
                    {ex.muscle_group}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {ex.target_sets} series · {ex.target_reps} reps · RIR {ex.target_rir}
                </p>
                {ex.notes && (
                  <p className="text-xs text-[var(--text-muted)] italic mt-1">{ex.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
