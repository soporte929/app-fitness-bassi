'use client'

import { useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DeleteClientDialog } from '@/components/trainer/delete-client-dialog'
import { ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react'
import { updateClientAction } from '../actions'
import type { ActivityLevel, Lifestyle, Objective, Phase, TrainingDays } from '@/lib/supabase/types'

type Props = {
  clientId: string
  clientName: string
  initial: {
    weight_kg: number
    body_fat_pct: number | null
    phase: Phase
    objective: Objective | null
    age: number | null
    height_cm: number | null
    lifestyle: Lifestyle | null
    training_days: TrainingDays | null
    activity_level: ActivityLevel
    daily_steps: number
    trainer_notes: string | null
  }
}

const phaseOpts: Array<{ value: Phase; label: string }> = [
  { value: 'deficit', label: 'Déficit calórico' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'surplus', label: 'Volumen' },
]

const objectiveOpts: Array<{ value: Objective; label: string }> = [
  { value: 'lose_fat', label: 'Perder grasa' },
  { value: 'gain_muscle', label: 'Ganar músculo' },
  { value: 'maintenance_high', label: 'Mantenimiento alto' },
  { value: 'maintenance_normal', label: 'Mantenimiento normal' },
]

const lifestyleOpts: Array<{ value: Lifestyle; label: string }> = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'light', label: 'Ligeramente activo' },
  { value: 'active', label: 'Activo' },
  { value: 'very_active', label: 'Muy activo' },
]

const trainingDaysOpts: Array<{ value: TrainingDays; label: string }> = [
  { value: '3', label: 'Sedentario — 3 días' },
  { value: '4-5', label: 'Ligeramente activo/activo — 4-5 días' },
  { value: '6', label: 'Muy activo — 6 días' },
]

const activityOpts: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'sedentary', label: 'Sedentario (legacy)' },
  { value: 'light', label: 'Ligero (legacy)' },
  { value: 'moderate', label: 'Moderado (legacy)' },
  { value: 'active', label: 'Activo (legacy)' },
  { value: 'very_active', label: 'Muy activo' },
]

const inputCls =
  'w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)] transition-all'
const sectionCls = 'text-xs font-medium text-[#6b7fa3] tracking-wide uppercase mt-6 mb-3'
const labelCls = 'text-xs text-[#a0a0a0] mb-1 block'

type FormValues = {
  weight_kg: string
  body_fat_pct: string
  phase: '' | Phase
  objective: '' | Objective
  age: string
  height_cm: string
  lifestyle: '' | Lifestyle
  training_days: '' | TrainingDays
  activity_level: ActivityLevel
  daily_steps: string
  trainer_notes: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function parseOptionalNumber(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function validate(form: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!form.phase) errors.phase = 'La fase es obligatoria'

  if (form.age !== '') {
    const age = Number(form.age)
    if (Number.isNaN(age) || age < 16 || age > 80) errors.age = 'Entre 16 y 80'
  }

  if (form.height_cm !== '') {
    const height = Number(form.height_cm)
    if (Number.isNaN(height) || height < 140 || height > 220) errors.height_cm = 'Entre 140 y 220 cm'
  }

  if (form.daily_steps !== '') {
    const steps = Number(form.daily_steps)
    if (Number.isNaN(steps) || steps < 0 || steps > 30000) errors.daily_steps = 'Entre 0 y 30000'
  }

  if (form.trainer_notes.length > 500) errors.trainer_notes = 'Máximo 500 caracteres'

  if (!form.weight_kg || Number(form.weight_kg) <= 0) {
    errors.weight_kg = 'Peso requerido y mayor a 0'
  }

  if (form.body_fat_pct !== '') {
    const bodyFat = Number(form.body_fat_pct)
    if (Number.isNaN(bodyFat) || bodyFat < 0 || bodyFat > 100) errors.body_fat_pct = 'Entre 0 y 100%'
  }

  return errors
}

export function EditClientPanel({ clientId, clientName, initial }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [del, setDel] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [f, setF] = useState<FormValues>({
    weight_kg: String(initial.weight_kg),
    body_fat_pct: initial.body_fat_pct != null ? String(initial.body_fat_pct) : '',
    phase: initial.phase,
    objective: initial.objective ?? '',
    age: initial.age != null ? String(initial.age) : '',
    height_cm: initial.height_cm != null ? String(initial.height_cm) : '',
    lifestyle: initial.lifestyle ?? '',
    training_days: initial.training_days ?? '',
    activity_level: initial.activity_level,
    daily_steps: String(initial.daily_steps),
    trainer_notes: initial.trainer_notes ?? '',
  })

  const initialComparable = useMemo(
    (): FormValues => ({
      weight_kg: String(initial.weight_kg),
      body_fat_pct: initial.body_fat_pct != null ? String(initial.body_fat_pct) : '',
      phase: initial.phase,
      objective: initial.objective ?? '',
      age: initial.age != null ? String(initial.age) : '',
      height_cm: initial.height_cm != null ? String(initial.height_cm) : '',
      lifestyle: initial.lifestyle ?? '',
      training_days: initial.training_days ?? '',
      activity_level: initial.activity_level,
      daily_steps: String(initial.daily_steps),
      trainer_notes: initial.trainer_notes ?? '',
    }),
    [initial]
  )

  const dirty =
    f.weight_kg !== initialComparable.weight_kg ||
    f.body_fat_pct !== initialComparable.body_fat_pct ||
    f.phase !== initialComparable.phase ||
    f.objective !== initialComparable.objective ||
    f.age !== initialComparable.age ||
    f.height_cm !== initialComparable.height_cm ||
    f.lifestyle !== initialComparable.lifestyle ||
    f.training_days !== initialComparable.training_days ||
    f.activity_level !== initialComparable.activity_level ||
    f.daily_steps !== initialComparable.daily_steps ||
    f.trainer_notes !== initialComparable.trainer_notes

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setF((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const reset = () => {
    setF(initialComparable)
    setErrors({})
    setOpen(false)
  }

  const save = () =>
    start(async () => {
      const validationErrors = validate(f)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
      const phase = f.phase
      if (!phase) {
        setErrors((prev) => ({ ...prev, phase: 'La fase es obligatoria' }))
        return
      }

      await updateClientAction(clientId, {
        weight_kg: Number(f.weight_kg),
        body_fat_pct: parseOptionalNumber(f.body_fat_pct),
        phase,
        objective: f.objective || null,
        age: parseOptionalNumber(f.age),
        height_cm: parseOptionalNumber(f.height_cm),
        lifestyle: f.lifestyle || null,
        training_days: f.training_days || null,
        activity_level: f.activity_level,
        daily_steps: f.daily_steps !== '' ? Number(f.daily_steps) : 0,
        trainer_notes: f.trainer_notes || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })

  return (
    <>
      <Card>
        <CardHeader>
          <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Editar datos del cliente</p>
            {open ? (
              <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </button>
        </CardHeader>

        {open && (
          <CardContent className="space-y-4 pt-0">
            <p className={sectionCls}>Datos personales</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Edad</label>
                <input
                  type="number"
                  min={16}
                  max={80}
                  value={f.age}
                  onChange={(e) => setField('age', e.target.value)}
                  className={inputCls}
                />
                {errors.age && <p className="text-xs text-[var(--danger)] mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className={labelCls}>Altura en cm</label>
                <input
                  type="number"
                  min={140}
                  max={220}
                  step={0.5}
                  value={f.height_cm}
                  onChange={(e) => setField('height_cm', e.target.value)}
                  className={inputCls}
                />
                {errors.height_cm && <p className="text-xs text-[var(--danger)] mt-1">{errors.height_cm}</p>}
              </div>
            </div>

            <p className={sectionCls}>Fase</p>
            <div>
              <label className={labelCls}>Fase *</label>
              <select value={f.phase} onChange={(e) => setField('phase', e.target.value as FormValues['phase'])} className={inputCls}>
                <option value="">Selecciona una fase</option>
                {phaseOpts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.phase && <p className="text-xs text-[var(--danger)] mt-1">{errors.phase}</p>}
            </div>

            <p className={sectionCls}>Objetivo</p>
            <div>
              <label className={labelCls}>Objetivo</label>
              <select value={f.objective} onChange={(e) => setField('objective', e.target.value as FormValues['objective'])} className={inputCls}>
                <option value="">Sin definir</option>
                {objectiveOpts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <p className={sectionCls}>Estilo de vida</p>
            <div>
              <label className={labelCls}>Estilo de vida</label>
              <select value={f.lifestyle} onChange={(e) => setField('lifestyle', e.target.value as FormValues['lifestyle'])} className={inputCls}>
                <option value="">Sin definir</option>
                {lifestyleOpts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <p className={sectionCls}>Entrenamiento</p>
            <div>
              <label className={labelCls}>Frecuencia de entrenamiento</label>
              <select
                value={f.training_days}
                onChange={(e) => setField('training_days', e.target.value as FormValues['training_days'])}
                className={inputCls}
              >
                <option value="">Sin definir</option>
                {trainingDaysOpts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <p className={sectionCls}>Pasos diarios</p>
            <div>
              <label className={labelCls}>Pasos diarios</label>
              <input
                type="number"
                min={0}
                max={30000}
                step={500}
                value={f.daily_steps}
                onChange={(e) => setField('daily_steps', e.target.value)}
                className={inputCls}
              />
              {errors.daily_steps && <p className="text-xs text-[var(--danger)] mt-1">{errors.daily_steps}</p>}
            </div>

            <p className={sectionCls}>Notas del trainer</p>
            <div>
              <label className={labelCls}>Notas del trainer</label>
              <textarea
                rows={4}
                maxLength={500}
                value={f.trainer_notes}
                onChange={(e) => setField('trainer_notes', e.target.value)}
                placeholder="Observaciones, lesiones, preferencias..."
                className={`${inputCls} resize-none`}
              />
              <p className="text-[10px] text-[#a0a0a0] mt-1">{f.trainer_notes.length}/500</p>
              {errors.trainer_notes && <p className="text-xs text-[var(--danger)] mt-1">{errors.trainer_notes}</p>}
            </div>

            <p className={sectionCls}>Composición corporal</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Peso (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={f.weight_kg}
                  onChange={(e) => setField('weight_kg', e.target.value)}
                  className={inputCls}
                />
                {errors.weight_kg && <p className="text-xs text-[var(--danger)] mt-1">{errors.weight_kg}</p>}
              </div>
              <div>
                <label className={labelCls}>% Grasa</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={f.body_fat_pct}
                  onChange={(e) => setField('body_fat_pct', e.target.value)}
                  className={inputCls}
                />
                {errors.body_fat_pct && <p className="text-xs text-[var(--danger)] mt-1">{errors.body_fat_pct}</p>}
              </div>
            </div>

            <p className={sectionCls}>Compatibilidad</p>
            <div>
              <label className={labelCls}>Nivel de actividad (legacy)</label>
              <select
                value={f.activity_level}
                onChange={(e) => setField('activity_level', e.target.value as ActivityLevel)}
                className={inputCls}
              >
                {activityOpts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <Button variant="danger" size="sm" onClick={() => setDel(true)} disabled={pending}>
                <Trash2 className="w-3.5 h-3.5" /> Borrar
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={reset} disabled={pending}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={save} disabled={pending || !dirty}>
                  {pending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…
                    </>
                  ) : saved ? (
                    '✓ Guardado'
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      {del && <DeleteClientDialog clientId={clientId} clientName={clientName} onCancel={() => setDel(false)} />}
    </>
  )
}
