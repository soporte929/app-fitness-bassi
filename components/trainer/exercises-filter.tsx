'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Dumbbell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type ExerciseItem = {
  id: string
  name: string
  muscle_group: string | null
  target_sets: number | null
  target_reps: string | null
  target_rir: number | null
  notes: string | null
}

interface Props {
  exercises: ExerciseItem[]
  muscleGroups: string[]
}

export function ExercisesFilter({ exercises, muscleGroups }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = selected
    ? exercises.filter(e => e.muscle_group === selected)
    : exercises

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Dumbbell className="w-12 h-12 text-[var(--text-muted)] mb-3" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Sin ejercicios</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Crea un plan con ejercicios para verlos aquí
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Chips de filtro por muscle_group */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 flex-wrap">
        <button
          onClick={() => setSelected(null)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
            selected === null
              ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
          )}
        >
          Todos
        </button>
        {muscleGroups.map(group => (
          <button
            key={group}
            onClick={() => setSelected(group)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              selected === group
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
            )}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Lista de ejercicios */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">Sin ejercicios en este grupo</p>
        </div>
      ) : (
        <div className="space-y-2 stagger">
          {filtered.map((ex, i) => (
            <div
              key={ex.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Card>
                <CardContent className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {ex.name}
                      </p>
                      {ex.muscle_group && (
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {ex.muscle_group}
                        </p>
                      )}
                      {ex.notes && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                          {ex.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {(ex.target_sets || ex.target_reps) && (
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          {ex.target_sets ? `${ex.target_sets} series` : ''}
                          {ex.target_sets && ex.target_reps ? ' × ' : ''}
                          {ex.target_reps ? `${ex.target_reps} reps` : ''}
                        </p>
                      )}
                      {ex.target_rir !== null && (
                        <p className="text-xs text-[var(--text-muted)]">RIR {ex.target_rir}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
