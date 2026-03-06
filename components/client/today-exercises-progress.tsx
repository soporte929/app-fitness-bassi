'use client'

import { useCallback, useMemo, useState } from 'react'
import { ExerciseCard, type ExerciseWithSets, type LastSetLog } from '@/components/client/exercise-card'

type Props = {
  exercises: ExerciseWithSets[]
  sessionId: string
  lastSetLogs: LastSetLog[]
}

function isExerciseCompleted(exercise: ExerciseWithSets): boolean {
  if (exercise.target_sets <= 0) return false

  const completedSetNumbers = new Set(
    exercise.set_logs.filter((setLog) => setLog.completed).map((setLog) => setLog.set_number)
  )

  return Array.from({ length: exercise.target_sets }, (_, index) => index + 1).every((setNumber) =>
    completedSetNumbers.has(setNumber)
  )
}

function buildCompletionMap(exercises: ExerciseWithSets[]): Record<string, boolean> {
  return exercises.reduce<Record<string, boolean>>((acc, exercise) => {
    acc[exercise.id] = isExerciseCompleted(exercise)
    return acc
  }, {})
}

export function TodayExercisesProgress({ exercises, sessionId, lastSetLogs }: Props) {
  const [exerciseCompletion, setExerciseCompletion] = useState<Record<string, boolean>>(() =>
    buildCompletionMap(exercises)
  )

  const completedExercises = useMemo(
    () => Object.values(exerciseCompletion).filter(Boolean).length,
    [exerciseCompletion]
  )
  const totalExercises = exercises.length
  const completionPct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

  const handleExerciseCompletionChange = useCallback((exerciseId: string, completed: boolean) => {
    setExerciseCompletion((prev) => {
      if (prev[exerciseId] === completed) return prev
      return { ...prev, [exerciseId]: completed }
    })
  }, [])

  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-[var(--bg-base)]/95 backdrop-blur-sm">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {completedExercises}/{totalExercises} ejercicios
            </p>
            <p className="text-sm font-medium text-[var(--text-secondary)] tabular-nums">{completionPct}%</p>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 stagger">
        {exercises.map((exercise, index) => (
          <div key={exercise.id} className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
            <ExerciseCard
              exercise={exercise}
              sessionId={sessionId}
              lastSetLogs={lastSetLogs}
              onCompletionChange={handleExerciseCompletionChange}
            />
          </div>
        ))}
      </div>
    </>
  )
}
