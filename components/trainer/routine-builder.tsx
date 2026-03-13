'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExercisePicker, type PickedExercise } from '@/components/trainer/exercise-picker'
import {
  MUSCLE_GROUP_OPTIONS,
  type RoutineBuilderInitial,
  type RoutinePlanInput,
} from '@/app/(trainer)/routines-templates/types'
import { createPlanAction, updatePlanAction } from '@/app/(trainer)/routines-templates/actions'

type ExerciseDraft = {
  local_id: string
  name: string
  muscle_group: string
  target_sets: string
  target_reps: string
  target_rir: string
  notes: string
}

type DayDraft = {
  local_id: string
  name: string
  exercises: ExerciseDraft[]
}

type Props = {
  initial?: RoutineBuilderInitial
  planId?: string
  structureLocked?: boolean
}

const inputCls =
  'w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]'

function makeLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function makeDefaultExercise(name = '', muscleGroup: string = MUSCLE_GROUP_OPTIONS[0]): ExerciseDraft {
  return {
    local_id: makeLocalId(),
    name,
    muscle_group: muscleGroup,
    target_sets: '3',
    target_reps: '8-12',
    target_rir: '2',
    notes: '',
  }
}

function makeDefaultDay(index: number): DayDraft {
  return {
    local_id: makeLocalId(),
    name: `Día ${index + 1}`,
    exercises: [],
  }
}

function normalizeDaysLength(days: DayDraft[], daysPerWeek: number): DayDraft[] {
  if (daysPerWeek <= 0) return []
  if (days.length === daysPerWeek) return days
  if (days.length > daysPerWeek) return days.slice(0, daysPerWeek)
  const nextDays = [...days]
  for (let index = days.length; index < daysPerWeek; index += 1) {
    nextDays.push(makeDefaultDay(index))
  }
  return nextDays
}

function buildInitialState(initial?: RoutineBuilderInitial) {
  const daysPerWeek = initial?.days_per_week ?? 3
  const rawDays = initial?.days ?? []

  const hydratedDays: DayDraft[] = rawDays.map((day) => ({
    local_id: makeLocalId(),
    name: day.name,
    exercises: day.exercises.map((exercise) => ({
      local_id: makeLocalId(),
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      target_sets: String(exercise.target_sets),
      target_reps: exercise.target_reps,
      target_rir: String(exercise.target_rir),
      notes: exercise.notes ?? '',
    })),
  }))

  const days = normalizeDaysLength(hydratedDays, daysPerWeek)

  return {
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    daysPerWeek,
    days,
    activeDayId: days[0]?.local_id ?? null,
  }
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [item] = next.splice(from, 1)
  if (!item) return items
  next.splice(to, 0, item)
  return next
}

// ─── Inline editable day name (used in Step 2) ───────────────────────────────

function EditableDayName({
  dayId,
  name,
  index,
  onUpdate,
}: {
  dayId: string
  name: string
  index: number
  onUpdate: (dayId: string, name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => onUpdate(dayId, e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            setEditing(false)
          }
        }}
        className={cn(inputCls, 'w-full min-w-0')}
        placeholder="Ej: Día A — Push"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Clic para editar"
      className="flex-1 min-w-0 text-left px-3 py-2 text-sm text-[var(--text-primary)] rounded-md border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors truncate"
    >
      {name || <span className="text-[var(--text-muted)] italic">Día {index + 1}</span>}
    </button>
  )
}

// ─── Day tab (Step 3) — editable on dbl-click or pencil ──────────────────────

function DayTab({
  day,
  index,
  isActive,
  exerciseCount,
  onClick,
  onNameChange,
}: {
  day: DayDraft
  index: number
  isActive: boolean
  exerciseCount: number
  onClick: () => void
  onNameChange: (dayId: string, name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation()
    setEditing(true)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={day.name}
        onChange={(e) => onNameChange(day.local_id, e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            setEditing(false)
          }
        }}
        className="flex-shrink-0 px-3 py-1.5 rounded-md text-sm border border-[var(--accent)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none w-36"
        placeholder={`Día ${index + 1}`}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={startEditing}
      className={cn(
        'group flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-all',
        isActive
          ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]'
          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
      )}
    >
      <span>{day.name || `Día ${index + 1}`}</span>
      {exerciseCount > 0 && (
        <span
          className={cn(
            'text-xs font-normal opacity-60',
            isActive ? 'text-[var(--bg-base)]' : 'text-[var(--text-muted)]'
          )}
        >
          ({exerciseCount})
        </span>
      )}
      <Pencil
        className={cn(
          'w-2.5 h-2.5 ml-0.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0',
          isActive ? 'text-[var(--bg-base)]' : 'text-[var(--text-secondary)]'
        )}
        onClick={startEditing}
      />
    </button>
  )
}

// ─── Exercise row — Hevy-style card ──────────────────────────────────────────

function ExerciseRow({
  exercise,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  exercise: ExerciseDraft
  index: number
  total: number
  onUpdate: (field: keyof Omit<ExerciseDraft, 'local_id'>, value: string) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  const cellInput =
    'w-full bg-[var(--text-primary)]/10 rounded-lg py-2 text-center text-sm text-[var(--text-primary)] border-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[var(--text-muted)]'

  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl p-3 mb-2">
      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        {/* Name — click to expand/collapse */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left min-w-0"
        >
          <span
            className={cn(
              'text-sm font-medium',
              exercise.name ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] italic'
            )}
          >
            {exercise.name || 'Sin nombre'}
          </span>
        </button>

        {/* Muscle badge + ··· menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--text-primary)]/10 text-[var(--text-secondary)]">
            {exercise.muscle_group}
          </span>

          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 transition-colors"
              aria-label="Más opciones"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[148px] bg-[var(--bg-surface)] border border-[var(--border-hover)] rounded-lg shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => { onMoveUp(); setMenuOpen(false) }}
                  disabled={index === 0}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" /> Mover arriba
                </button>
                <button
                  type="button"
                  onClick={() => { onMoveDown(); setMenuOpen(false) }}
                  disabled={index === total - 1}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" /> Mover abajo
                </button>
                <div className="border-t border-[var(--border)]" />
                <button
                  type="button"
                  onClick={() => { onRemove(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary line */}
      <p className="text-xs text-[var(--text-muted)] mt-0.5">
        {exercise.target_sets} series · {exercise.target_reps} reps · RIR {exercise.target_rir}
      </p>

      {/* ── Expanded form ──────────────────────────────────────── */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          {/* Series / Reps / RIR */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Series
              </p>
              <input
                type="number"
                min={1}
                value={exercise.target_sets}
                onChange={(e) => onUpdate('target_sets', e.target.value)}
                className={cellInput}
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Reps
              </p>
              <input
                value={exercise.target_reps}
                onChange={(e) => onUpdate('target_reps', e.target.value)}
                placeholder="8-12"
                className={cellInput}
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                RIR
              </p>
              <input
                type="number"
                min={0}
                max={5}
                value={exercise.target_rir}
                onChange={(e) => onUpdate('target_rir', e.target.value)}
                className={cellInput}
              />
            </div>
          </div>

          {/* Notes */}
          <textarea
            value={exercise.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
            rows={2}
            placeholder="Notas opcionales…"
            className="w-full mt-2 bg-[var(--text-primary)]/10 rounded-lg p-2 text-xs text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] border-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
          />
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function RoutineBuilder({ initial, planId, structureLocked = false }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pickerDayId, setPickerDayId] = useState<string | null>(null)

  const [state, setState] = useState(() => buildInitialState(initial))

  const isEditing = Boolean(planId)

  const activeDay = useMemo(
    () => state.days.find((d) => d.local_id === state.activeDayId) ?? state.days[0] ?? null,
    [state.activeDayId, state.days]
  )

  function setStep(step: 1 | 2 | 3) {
    if (structureLocked && step !== 1) return
    setCurrentStep(step)
  }

  function setName(name: string) {
    setState((prev) => ({ ...prev, name }))
  }

  function setDescription(description: string) {
    setState((prev) => ({ ...prev, description }))
  }



  function setDaysPerWeek(nextDaysPerWeek: number) {
    setState((prev) => {
      const normalizedDays = normalizeDaysLength(prev.days, nextDaysPerWeek)
      const hasActiveDay = normalizedDays.some((d) => d.local_id === prev.activeDayId)
      return {
        ...prev,
        daysPerWeek: nextDaysPerWeek,
        days: normalizedDays,
        activeDayId: hasActiveDay ? prev.activeDayId : normalizedDays[0]?.local_id ?? null,
      }
    })
  }

  function addDay() {
    setState((prev) => {
      if (prev.days.length >= prev.daysPerWeek) return prev
      const newDay = makeDefaultDay(prev.days.length)
      return {
        ...prev,
        days: [...prev.days, newDay],
        activeDayId: prev.activeDayId ?? newDay.local_id,
      }
    })
  }

  function updateDayName(dayId: string, name: string) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.local_id === dayId ? { ...d, name } : d)),
    }))
  }

  function removeDay(dayId: string) {
    setState((prev) => {
      if (prev.days.length <= 1) return prev
      const nextDays = prev.days.filter((d) => d.local_id !== dayId)
      const nextActive = nextDays.some((d) => d.local_id === prev.activeDayId)
        ? prev.activeDayId
        : nextDays[0]?.local_id ?? null
      return { ...prev, days: nextDays, activeDayId: nextActive }
    })
  }

  function moveDay(dayId: string, direction: -1 | 1) {
    setState((prev) => {
      const index = prev.days.findIndex((d) => d.local_id === dayId)
      if (index < 0) return prev
      const target = index + direction
      if (target < 0 || target >= prev.days.length) return prev
      return { ...prev, days: moveItem(prev.days, index, target) }
    })
  }

  function setActiveDay(dayId: string) {
    setState((prev) => ({ ...prev, activeDayId: dayId }))
  }

  function addExerciseFromPicker(dayId: string, picked: PickedExercise) {
    const exercise = makeDefaultExercise(picked.name, picked.muscleGroup)
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.local_id === dayId ? { ...d, exercises: [...d.exercises, exercise] } : d
      ),
    }))
  }

  function updateExercise(
    dayId: string,
    exerciseId: string,
    field: keyof Omit<ExerciseDraft, 'local_id'>,
    value: string
  ) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.local_id !== dayId) return d
        return {
          ...d,
          exercises: d.exercises.map((ex) =>
            ex.local_id === exerciseId ? { ...ex, [field]: value } : ex
          ),
        }
      }),
    }))
  }

  function removeExercise(dayId: string, exerciseId: string) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.local_id !== dayId) return d
        return { ...d, exercises: d.exercises.filter((ex) => ex.local_id !== exerciseId) }
      }),
    }))
  }

  function moveExercise(dayId: string, exerciseId: string, direction: -1 | 1) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.local_id !== dayId) return d
        const index = d.exercises.findIndex((ex) => ex.local_id === exerciseId)
        if (index < 0) return d
        const target = index + direction
        if (target < 0 || target >= d.exercises.length) return d
        return { ...d, exercises: moveItem(d.exercises, index, target) }
      }),
    }))
  }

  function buildPayload(): RoutinePlanInput {
    return {
      name: state.name.trim(),
      description: state.description.trim() || null,
      days_per_week: state.daysPerWeek,
      replace_structure: !structureLocked,
      days: state.days.map((d, di) => ({
        name: d.name.trim(),
        order_index: di,
        exercises: d.exercises.map((ex, ei) => ({
          name: ex.name.trim(),
          muscle_group: ex.muscle_group,
          target_sets: Number(ex.target_sets),
          target_reps: ex.target_reps.trim(),
          target_rir: Number(ex.target_rir),
          notes: ex.notes.trim() || null,
          order_index: ei,
        })),
      })),
    }
  }

  function validateBeforeSubmit(payload: RoutinePlanInput): string | null {
    if (payload.name.length === 0) return 'El nombre del plan es obligatorio'
    if (payload.days_per_week < 1 || payload.days_per_week > 7) return 'Días por semana inválido'
    if (structureLocked) return null
    if (payload.days.length !== payload.days_per_week)
      return 'El número de días debe coincidir con días por semana'
    for (const day of payload.days) {
      if (day.name.length === 0) return 'Todos los días deben tener nombre'
      for (const ex of day.exercises) {
        if (ex.name.length === 0) return 'Todos los ejercicios deben tener nombre'
        if (ex.target_reps.length === 0) return 'Todos los ejercicios deben tener repeticiones objetivo'
        if (ex.target_sets < 1) return 'Las series deben ser mayor o igual a 1'
        if (ex.target_rir < 0 || ex.target_rir > 5) return 'El RIR debe estar entre 0 y 5'
      }
    }
    return null
  }

  function save() {
    setServerError(null)
    const payload = buildPayload()
    const validationError = validateBeforeSubmit(payload)
    if (validationError) {
      setServerError(validationError)
      return
    }
    startTransition(async () => {
      if (planId) {
        const result = await updatePlanAction(planId, payload)
        if (!result.success) {
          setServerError(result.error ?? 'No se pudo guardar el plan')
          return
        }
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 1600)
        return
      }
      const result = await createPlanAction(payload)
      if (!result.success || !result.planId) {
        setServerError(result.error ?? 'No se pudo crear el plan')
        return
      }
      router.push(`/routines-templates/${result.planId}`)
      router.refresh()
    })
  }

  const stepButton = (step: 1 | 2 | 3, label: string) => {
    const disabled = structureLocked && step !== 1
    return (
      <button
        key={step}
        type="button"
        onClick={() => setStep(step)}
        disabled={disabled}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-all border',
          currentStep === step
            ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]'
            : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg">
        {/* Header / step nav */}
        <div className="px-6 py-5 border-b border-[var(--border)] space-y-3">
          <div className="flex flex-wrap gap-2">
            {stepButton(1, '1. Info básica')}
            {stepButton(2, '2. Ejercicios')}
            {stepButton(3, '3. Días')}
          </div>

          {structureLocked && (
            <div className="bg-[var(--warning)]/8 border border-[var(--warning)]/25 rounded-md px-4 py-3">
              <p className="text-sm text-[var(--warning)]">
                Este plan ya tiene sesiones registradas. Solo puedes editar información básica.
              </p>
            </div>
          )}

          {serverError && (
            <div className="bg-[var(--danger)]/8 border border-[var(--danger)]/25 rounded-md px-4 py-3">
              <p className="text-sm text-[var(--danger)]">{serverError}</p>
            </div>
          )}
        </div>

        {/* Step content */}
        <div className="px-6 py-5 space-y-4">
          {/* ── STEP 1 ──────────────────────────────────────────── */}
          {currentStep === 1 && (
            <>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Nombre del plan *
                </label>
                <input
                  value={state.name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Fuerza 4 días"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Descripción
                </label>
                <textarea
                  value={state.description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Objetivo del plan, notas para el cliente..."
                  className={cn(inputCls, 'resize-none')}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Días por semana
                </label>
                <Select
                  value={String(state.daysPerWeek)}
                  onValueChange={(v) => setDaysPerWeek(Number(v))}
                  disabled={structureLocked}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((v) => (
                      <SelectItem key={v} value={String(v)}>
                        {`${v} día${v > 1 ? 's' : ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


            </>
          )}

          {/* ── STEP 2 ──────────────────────────────────────────── */}
          {currentStep === 2 && !structureLocked && (
            <div className="space-y-4">
              {/* Scrollable day tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {state.days.map((day, index) => (
                  <DayTab
                    key={day.local_id}
                    day={day}
                    index={index}
                    isActive={activeDay?.local_id === day.local_id}
                    exerciseCount={day.exercises.length}
                    onClick={() => setActiveDay(day.local_id)}
                    onNameChange={updateDayName}
                  />
                ))}
              </div>

              {/* Exercise list for active day */}
              {activeDay && (
                <div className="space-y-2">
                  {activeDay.exercises.length === 0 ? (
                    /* Empty state — centered CTA */
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <p className="text-sm text-[var(--text-muted)]">
                        Sin ejercicios para este día
                      </p>
                      <button
                        type="button"
                        onClick={() => setPickerDayId(activeDay.local_id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4" />
                        Añadir ejercicio
                      </button>
                    </div>
                  ) : (
                    <>
                      {activeDay.exercises.map((exercise, index) => (
                        <ExerciseRow
                          key={exercise.local_id}
                          exercise={exercise}
                          index={index}
                          total={activeDay.exercises.length}
                          onUpdate={(field, value) =>
                            updateExercise(activeDay.local_id, exercise.local_id, field, value)
                          }
                          onRemove={() => removeExercise(activeDay.local_id, exercise.local_id)}
                          onMoveUp={() => moveExercise(activeDay.local_id, exercise.local_id, -1)}
                          onMoveDown={() =>
                            moveExercise(activeDay.local_id, exercise.local_id, 1)
                          }
                        />
                      ))}

                      {/* Add more exercises */}
                      <button
                        type="button"
                        onClick={() => setPickerDayId(activeDay.local_id)}
                        className="w-full border border-dashed border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-muted)] flex items-center justify-center gap-2 hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Añadir ejercicio
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 ──────────────────────────────────────────── */}
          {currentStep === 3 && !structureLocked && (
            <div className="space-y-4">
              <div className="space-y-2">
                {state.days.map((day, index) => (
                  <div
                    key={day.local_id}
                    className="rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2.5 flex items-center gap-2 min-w-0"
                  >
                    <span className="text-xs text-[var(--text-muted)] w-8 flex-shrink-0 text-center">
                      #{index + 1}
                    </span>
                    <EditableDayName
                      dayId={day.local_id}
                      name={day.name}
                      index={index}
                      onUpdate={updateDayName}
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => moveDay(day.local_id, -1)}
                        disabled={index === 0}
                        aria-label="Subir día"
                        className="w-7 h-7 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDay(day.local_id, 1)}
                        disabled={index === state.days.length - 1}
                        aria-label="Bajar día"
                        className="w-7 h-7 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDay(day.local_id)}
                        disabled={state.days.length <= 1}
                        aria-label="Eliminar día"
                        className="w-7 h-7 rounded-md border border-[var(--border)] text-[var(--danger)] hover:bg-[var(--danger)]/10 flex items-center justify-center disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={addDay}
                variant="secondary"
                size="sm"
                disabled={state.days.length >= state.daysPerWeek}
              >
                <Plus className="w-3.5 h-3.5" /> Añadir día
              </Button>

              {/* Save button — prominent at bottom of step 3 */}
              <div className="pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={save}
                  disabled={pending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {pending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando…
                    </>
                  ) : saved ? (
                    '✓ Guardado'
                  ) : (
                    'Guardar rutina'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer — navigation only */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((Math.max(1, currentStep - 1) as 1 | 2 | 3))}
            disabled={currentStep === 1 || pending}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStep((Math.min(3, currentStep + 1) as 1 | 2 | 3))}
            disabled={currentStep === 3 || pending || (structureLocked && currentStep === 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Exercise picker portal */}
      <ExercisePicker
        open={pickerDayId !== null}
        onClose={() => setPickerDayId(null)}
        onSelect={(picked) => {
          if (pickerDayId) addExerciseFromPicker(pickerDayId, picked)
        }}
      />
    </>
  )
}
