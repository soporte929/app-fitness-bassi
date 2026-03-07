'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRef } from 'react'
import { GripVertical } from 'lucide-react'
import { ExerciseCard, type ExerciseWithSets, type LastSetLog } from '@/components/client/exercise-card'

type Props = {
  exercises: ExerciseWithSets[]
  sessionId: string
  sessionStartedAt: string
  lastSetLogs: LastSetLog[]
}

type ExerciseStats = {
  total: number
  completed: number
}

function buildCompletionMap(exercises: ExerciseWithSets[]): Record<string, ExerciseStats> {
  return exercises.reduce<Record<string, ExerciseStats>>((acc, exercise) => {
    // We use target_sets as the source of truth for total sets
    const total = exercise.target_sets
    const completed = exercise.set_logs.filter((s) => s.completed).length
    acc[exercise.id] = { total, completed }
    return acc
  }, {})
}

export function TodayExercisesProgress({ exercises, sessionId, sessionStartedAt, lastSetLogs }: Props) {
  const [completionMap, setCompletionMap] = useState<Record<string, ExerciseStats>>(() =>
    buildCompletionMap(exercises)
  )

  const handleSetCountChange = useCallback((exerciseId: string, completedSets: number) => {
    setCompletionMap((prev) => {
      const current = prev[exerciseId]
      if (current && current.completed === completedSets) return prev
      return {
        ...prev,
        [exerciseId]: { ...current, completed: completedSets },
      }
    })
  }, [])

  // Timer logic
  const [elapsed, setElapsed] = useState(0)
  const [orderedExercises, setOrderedExercises] = useState(exercises)
  const [dragMode, setDragMode] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const startMs = new Date(sessionStartedAt).getTime()
    const tick = () => {
      const ms = Math.max(0, Date.now() - startMs)
      setElapsed(Math.floor(ms / 1000))
    }
    tick()
    const intervalId = setInterval(tick, 1000)
    return () => clearInterval(intervalId)
  }, [sessionStartedAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

  // Derived metrics
  const exercisesArray = orderedExercises.map((ex) => ({ id: ex.id, stats: completionMap[ex.id] }))
  const totalExercises = orderedExercises.length
  const completedExercises = exercisesArray.filter(
    (ex) => ex.stats && ex.stats.completed === ex.stats.total && ex.stats.total > 0
  ).length

  const totalSets = exercisesArray.reduce((acc, ex) => acc + (ex.stats?.total || 0), 0)
  const completedSets = exercisesArray.reduce((acc, ex) => acc + (ex.stats?.completed || 0), 0)
  const completionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  const handlePressStart = (index: number) => {
    longPressTimer.current = setTimeout(() => {
      setDragMode(true)
      setDragIndex(index)
      if ('vibrate' in navigator) navigator.vibrate(50)
    }, 500)
  }

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleDrop = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) return
    const newOrder = [...orderedExercises]
    const [moved] = newOrder.splice(dragIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    setOrderedExercises(newOrder)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <>
      <div
        className="sticky top-0 z-20 -mx-4 px-4 pt-3 pb-3"
        style={{ background: '#191919', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Line 1 — exercises + timer + percentage */}
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium" style={{ fontSize: '13px', color: '#e8e8e6' }}>
            {completedExercises}/{totalExercises} ejercicios
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono" style={{ fontSize: '13px', color: '#e8e8e6' }}>
              {timeStr}
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: '#6b7fa3' }}>
              {completionPct}%
            </span>
          </div>
        </div>

        {/* Line 2 — series counter */}
        <p style={{ fontSize: '10px', color: '#a0a0a0', marginBottom: '6px' }}>
          {completedSets}/{totalSets} series
        </p>

        {/* Line 3 — segmented progress bar */}
        <div className="flex items-center w-full gap-[3px]">
          {exercisesArray.map((ex) => {
            const total = ex.stats?.total || 0
            const completed = ex.stats?.completed || 0
            const pct = total > 0 ? (completed / total) * 100 : 0
            const isFullyDone = completed === total && total > 0

            return (
              <div
                key={ex.id}
                className="relative flex-1 rounded-full overflow-hidden"
                style={{ height: 5, background: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: isFullyDone ? '#6b7fa3' : 'rgba(107,127,163,0.45)',
                    transition: 'width 500ms ease-out',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        {/* Botón salir de drag mode */}
        {dragMode && (
          <button
            onClick={() => { setDragMode(false); setDragIndex(null); setDragOverIndex(null) }}
            className="w-full py-2 mb-3 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(107,127,163,0.15)', color: '#6b7fa3', border: '1px solid rgba(107,127,163,0.25)' }}
          >
            ✓ Guardar orden
          </button>
        )}

        <div className="space-y-3">
          {orderedExercises.map((exercise, index) => (
            <div
              key={exercise.id}
              draggable={dragMode}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
              onMouseDown={() => handlePressStart(index)}
              onMouseUp={handlePressEnd}
              onTouchStart={(e) => { e.stopPropagation(); handlePressStart(index) }}
              onTouchEnd={handlePressEnd}
              className={!dragMode ? 'animate-fade-in' : ''}
              style={{
                animationDelay: dragMode ? '0ms' : `${index * 60}ms`,
                opacity: dragIndex === index ? 0.4 : 1,
                transform: dragOverIndex === index && dragIndex !== index ? 'scale(1.01)' : 'scale(1)',
                transition: 'transform 0.15s ease, opacity 0.15s ease',
                cursor: dragMode ? 'grab' : 'default',
              }}
            >
              {dragMode ? (
                /* Tarjeta colapsada en modo drag */
                <div
                  className="rounded-xl flex items-center justify-between px-4 py-3"
                  style={{
                    background: '#212121',
                    border: dragOverIndex === index && dragIndex !== index
                      ? '1px solid rgba(107,127,163,0.5)'
                      : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#e8e8e6' }}>
                      {exercise.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#a0a0a0' }}>
                      {exercise.muscle_group} · {exercise.target_sets} series
                    </p>
                  </div>
                  <GripVertical className="w-5 h-5 flex-shrink-0" style={{ color: '#6b7fa3' }} />
                </div>
              ) : (
                <ExerciseCard
                  exercise={exercise}
                  sessionId={sessionId}
                  lastSetLogs={lastSetLogs}
                  onSetCountChange={handleSetCountChange}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
