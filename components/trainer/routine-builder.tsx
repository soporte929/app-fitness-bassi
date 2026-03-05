'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  MUSCLE_GROUP_OPTIONS,
  type RoutineBuilderInitial,
  type RoutineClientOption,
  type RoutineMode,
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
  clients: RoutineClientOption[]
  initial?: RoutineBuilderInitial
  planId?: string
  structureLocked?: boolean
}

const inputCls =
  'w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all'

function makeLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function makeDefaultExercise(): ExerciseDraft {
  return {
    local_id: makeLocalId(),
    name: '',
    muscle_group: MUSCLE_GROUP_OPTIONS[0],
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

  if (days.length > daysPerWeek) {
    return days.slice(0, daysPerWeek)
  }

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
    mode: initial?.mode ?? ('template' as RoutineMode),
    clientId: initial?.client_id ?? null,
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

export function RoutineBuilder({ clients, initial, planId, structureLocked = false }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [state, setState] = useState(() => buildInitialState(initial))

  const isEditing = Boolean(planId)

  const activeDay = useMemo(
    () => state.days.find((day) => day.local_id === state.activeDayId) ?? state.days[0] ?? null,
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

  function setMode(mode: RoutineMode) {
    if (isEditing) return

    setState((prev) => ({
      ...prev,
      mode,
      clientId: mode === 'client' ? prev.clientId ?? clients[0]?.id ?? null : null,
    }))
  }

  function setClientId(clientId: string) {
    if (isEditing) return
    setState((prev) => ({ ...prev, clientId }))
  }

  function setDaysPerWeek(nextDaysPerWeek: number) {
    setState((prev) => {
      const normalizedDays = normalizeDaysLength(prev.days, nextDaysPerWeek)
      const hasActiveDay = normalizedDays.some((day) => day.local_id === prev.activeDayId)
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
      days: prev.days.map((day) => (day.local_id === dayId ? { ...day, name } : day)),
    }))
  }

  function removeDay(dayId: string) {
    setState((prev) => {
      if (prev.days.length <= 1) return prev
      const nextDays = prev.days.filter((day) => day.local_id !== dayId)
      const nextActive = nextDays.some((day) => day.local_id === prev.activeDayId)
        ? prev.activeDayId
        : nextDays[0]?.local_id ?? null
      return {
        ...prev,
        days: nextDays,
        activeDayId: nextActive,
      }
    })
  }

  function moveDay(dayId: string, direction: -1 | 1) {
    setState((prev) => {
      const index = prev.days.findIndex((day) => day.local_id === dayId)
      if (index < 0) return prev

      const target = index + direction
      if (target < 0 || target >= prev.days.length) return prev

      return {
        ...prev,
        days: moveItem(prev.days, index, target),
      }
    })
  }

  function setActiveDay(dayId: string) {
    setState((prev) => ({ ...prev, activeDayId: dayId }))
  }

  function addExercise(dayId: string) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.local_id === dayId
          ? { ...day, exercises: [...day.exercises, makeDefaultExercise()] }
          : day
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
      days: prev.days.map((day) => {
        if (day.local_id !== dayId) return day
        return {
          ...day,
          exercises: day.exercises.map((exercise) =>
            exercise.local_id === exerciseId ? { ...exercise, [field]: value } : exercise
          ),
        }
      }),
    }))
  }

  function removeExercise(dayId: string, exerciseId: string) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.local_id !== dayId) return day
        return {
          ...day,
          exercises: day.exercises.filter((exercise) => exercise.local_id !== exerciseId),
        }
      }),
    }))
  }

  function moveExercise(dayId: string, exerciseId: string, direction: -1 | 1) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.local_id !== dayId) return day

        const index = day.exercises.findIndex((exercise) => exercise.local_id === exerciseId)
        if (index < 0) return day

        const target = index + direction
        if (target < 0 || target >= day.exercises.length) return day

        return {
          ...day,
          exercises: moveItem(day.exercises, index, target),
        }
      }),
    }))
  }

  function buildPayload(): RoutinePlanInput {
    return {
      name: state.name.trim(),
      description: state.description.trim() || null,
      days_per_week: state.daysPerWeek,
      mode: state.mode,
      client_id: state.mode === 'client' ? state.clientId : null,
      replace_structure: !structureLocked,
      days: state.days.map((day, dayIndex) => ({
        name: day.name.trim(),
        order_index: dayIndex,
        exercises: day.exercises.map((exercise, exerciseIndex) => ({
          name: exercise.name.trim(),
          muscle_group: exercise.muscle_group,
          target_sets: Number(exercise.target_sets),
          target_reps: exercise.target_reps.trim(),
          target_rir: Number(exercise.target_rir),
          notes: exercise.notes.trim() || null,
          order_index: exerciseIndex,
        })),
      })),
    }
  }

  function validateBeforeSubmit(payload: RoutinePlanInput): string | null {
    if (payload.name.length === 0) return 'El nombre del plan es obligatorio'
    if (payload.days_per_week < 1 || payload.days_per_week > 7) return 'Días por semana inválido'
    if (payload.mode === 'client' && !payload.client_id) return 'Debes seleccionar un cliente'

    if (structureLocked) return null

    if (payload.days.length !== payload.days_per_week) {
      return 'El número de días debe coincidir con días por semana'
    }

    for (const day of payload.days) {
      if (day.name.length === 0) return 'Todos los días deben tener nombre'
      for (const exercise of day.exercises) {
        if (exercise.name.length === 0) return 'Todos los ejercicios deben tener nombre'
        if (exercise.target_reps.length === 0) return 'Todos los ejercicios deben tener repeticiones objetivo'
        if (exercise.target_sets < 1) return 'Las series deben ser mayor o igual a 1'
        if (exercise.target_rir < 0 || exercise.target_rir > 5) return 'El RIR debe estar entre 0 y 5'
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
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
          currentStep === step
            ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]'
            : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg">
      <div className="px-6 py-5 border-b border-[var(--border)] space-y-3">
        <div className="flex flex-wrap gap-2">
          {stepButton(1, '1. Info básica')}
          {stepButton(2, '2. Días')}
          {stepButton(3, '3. Ejercicios')}
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

      <div className="px-6 py-5 space-y-4">
        {currentStep === 1 && (
          <>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Nombre del plan *</label>
              <input
                value={state.name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej: Fuerza 4 días"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Descripción</label>
              <textarea
                value={state.description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Objetivo del plan, notas para el cliente..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Días por semana</label>
                <select
                  value={state.daysPerWeek}
                  onChange={(event) => setDaysPerWeek(Number(event.target.value))}
                  disabled={structureLocked}
                  className={inputCls}
                >
                  {Array.from({ length: 7 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('template')}
                    disabled={isEditing}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      state.mode === 'template'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-base)]'
                    } ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    Template global
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('client')}
                    disabled={isEditing}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      state.mode === 'client'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-base)]'
                    } ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    Plan para cliente
                  </button>
                </div>
                {isEditing && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                    El tipo y cliente asignado no se pueden cambiar en edición.
                  </p>
                )}
              </div>
            </div>

            {state.mode === 'client' && (
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Cliente</label>
                <select
                  value={state.clientId ?? ''}
                  onChange={(event) => setClientId(event.target.value)}
                  disabled={isEditing || clients.length === 0}
                  className={inputCls}
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {currentStep === 2 && !structureLocked && (
          <>
            <div className="space-y-2">
              {state.days.map((day, index) => (
                <div
                  key={day.local_id}
                  className="rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-3 flex items-center gap-2"
                >
                  <span className="text-xs text-[var(--text-muted)] w-10">#{index + 1}</span>
                  <input
                    value={day.name}
                    onChange={(event) => updateDayName(day.local_id, event.target.value)}
                    className={inputCls}
                    placeholder={`Día ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => moveDay(day.local_id, -1)}
                    className="w-8 h-8 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center"
                    disabled={index === 0}
                    aria-label="Subir día"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDay(day.local_id, 1)}
                    className="w-8 h-8 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center"
                    disabled={index === state.days.length - 1}
                    aria-label="Bajar día"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDay(day.local_id)}
                    className="w-8 h-8 rounded-md border border-[var(--border)] text-[var(--danger)] hover:bg-[var(--danger)]/10 flex items-center justify-center"
                    disabled={state.days.length <= 1}
                    aria-label="Eliminar día"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <Button onClick={addDay} variant="secondary" size="sm" disabled={state.days.length >= state.daysPerWeek}>
              <Plus className="w-3.5 h-3.5" /> Añadir día
            </Button>
          </>
        )}

        {currentStep === 3 && !structureLocked && (
          <>
            <div className="flex flex-wrap gap-2">
              {state.days.map((day) => (
                <button
                  key={day.local_id}
                  type="button"
                  onClick={() => setActiveDay(day.local_id)}
                  className={`px-3 py-1.5 rounded-md text-sm border ${
                    activeDay?.local_id === day.local_id
                      ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {day.name || 'Día sin nombre'}
                </button>
              ))}
            </div>

            {activeDay && (
              <div className="space-y-3">
                {activeDay.exercises.map((exercise, index) => (
                  <div key={exercise.local_id} className="rounded-md border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">Ejercicio #{index + 1}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveExercise(activeDay.local_id, exercise.local_id, -1)}
                          disabled={index === 0}
                          className="w-7 h-7 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center"
                          aria-label="Subir ejercicio"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(activeDay.local_id, exercise.local_id, 1)}
                          disabled={index === activeDay.exercises.length - 1}
                          className="w-7 h-7 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center"
                          aria-label="Bajar ejercicio"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(activeDay.local_id, exercise.local_id)}
                          className="w-7 h-7 rounded-md border border-[var(--border)] text-[var(--danger)] hover:bg-[var(--danger)]/10 flex items-center justify-center"
                          aria-label="Eliminar ejercicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Nombre *</label>
                        <input
                          value={exercise.name}
                          onChange={(event) =>
                            updateExercise(activeDay.local_id, exercise.local_id, 'name', event.target.value)
                          }
                          className={inputCls}
                          placeholder="Ej: Press banca"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Grupo muscular</label>
                        <select
                          value={exercise.muscle_group}
                          onChange={(event) =>
                            updateExercise(
                              activeDay.local_id,
                              exercise.local_id,
                              'muscle_group',
                              event.target.value
                            )
                          }
                          className={inputCls}
                        >
                          {MUSCLE_GROUP_OPTIONS.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Series objetivo</label>
                        <input
                          type="number"
                          min={1}
                          value={exercise.target_sets}
                          onChange={(event) =>
                            updateExercise(
                              activeDay.local_id,
                              exercise.local_id,
                              'target_sets',
                              event.target.value
                            )
                          }
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Reps objetivo *</label>
                        <input
                          value={exercise.target_reps}
                          onChange={(event) =>
                            updateExercise(
                              activeDay.local_id,
                              exercise.local_id,
                              'target_reps',
                              event.target.value
                            )
                          }
                          className={inputCls}
                          placeholder="8-12"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">RIR objetivo</label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          value={exercise.target_rir}
                          onChange={(event) =>
                            updateExercise(
                              activeDay.local_id,
                              exercise.local_id,
                              'target_rir',
                              event.target.value
                            )
                          }
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Notas</label>
                      <textarea
                        rows={2}
                        value={exercise.notes}
                        onChange={(event) =>
                          updateExercise(activeDay.local_id, exercise.local_id, 'notes', event.target.value)
                        }
                        className={`${inputCls} resize-none`}
                        placeholder="Indicaciones técnicas, tempo, descansos..."
                      />
                    </div>
                  </div>
                ))}

                <Button variant="secondary" size="sm" onClick={() => addExercise(activeDay.local_id)}>
                  <Plus className="w-3.5 h-3.5" /> Añadir ejercicio
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-6 py-4 border-t border-[var(--border)] flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
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

        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…
            </>
          ) : saved ? (
            '✓ Guardado'
          ) : (
            'Guardar plan'
          )}
        </Button>
      </div>
    </div>
  )
}
