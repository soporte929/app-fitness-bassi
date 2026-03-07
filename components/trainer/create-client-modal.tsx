'use client'

import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/custom-select'
import { Loader2, X } from 'lucide-react'
import { createClientAction } from '@/app/(trainer)/clients/actions'
import type { ActivityLevel, Lifestyle, Objective, Phase, TrainingDays } from '@/lib/supabase/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const phaseOptions: Array<{ value: Phase; label: string }> = [
  { value: 'deficit', label: 'Déficit calórico' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'surplus', label: 'Volumen' },
]

const objectiveOptions: Array<{ value: Objective; label: string }> = [
  { value: 'lose_fat', label: 'Perder grasa' },
  { value: 'gain_muscle', label: 'Ganar músculo' },
  { value: 'maintenance_high', label: 'Mantenimiento alto' },
  { value: 'maintenance_normal', label: 'Mantenimiento normal' },
]

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentario (legacy)' },
  { value: 'light', label: 'Ligero (legacy)' },
  { value: 'moderate', label: 'Moderado (legacy)' },
  { value: 'active', label: 'Activo (legacy)' },
  { value: 'very_active', label: 'Muy activo' },
]

const lifestyleOptions: Array<{ value: Lifestyle; label: string }> = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'light', label: 'Ligeramente activo' },
  { value: 'active', label: 'Activo' },
  { value: 'very_active', label: 'Muy activo' },
]

const trainingDaysOptions: Array<{ value: TrainingDays; label: string }> = [
  { value: '3', label: 'Sedentario — 3 días' },
  { value: '4-5', label: 'Ligeramente activo/activo — 4-5 días' },
  { value: '6', label: 'Muy activo — 6 días' },
]

const inputCls =
  'w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)] transition-all'

const sectionCls = 'text-xs font-medium text-[#6b7fa3] tracking-wide uppercase mt-6 mb-3'
const labelCls = 'text-xs text-[#a0a0a0] mb-1 block'

const today = new Date().toISOString().split('T')[0]

const defaultForm = {
  email: '',
  full_name: '',
  phase: '' as '' | Phase,
  objective: '' as '' | Objective,
  lifestyle: '' as '' | Lifestyle,
  training_days: '' as '' | TrainingDays,
  age: '',
  height_cm: '',
  weight_kg: '',
  body_fat_pct: '',
  activity_level: 'moderate' as ActivityLevel,
  daily_steps: '',
  target_weight_kg: '',
  joined_date: today,
  trainer_notes: '',
}

type FormErrors = Partial<Record<keyof typeof defaultForm, string>>

function validate(form: typeof defaultForm): FormErrors {
  const errors: FormErrors = {}
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Email inválido'
  if (form.full_name.trim().length < 3) errors.full_name = 'Mínimo 3 caracteres'
  if (!form.phase) errors.phase = 'La fase es obligatoria'

  if (form.age !== '') {
    const age = Number(form.age)
    if (Number.isNaN(age) || age < 16 || age > 80) errors.age = 'Entre 16 y 80'
  }

  if (form.height_cm !== '') {
    const height = Number(form.height_cm)
    if (Number.isNaN(height) || height < 140 || height > 220) errors.height_cm = 'Entre 140 y 220 cm'
  }

  const w = Number(form.weight_kg)
  if (!form.weight_kg || w <= 0) errors.weight_kg = 'Peso requerido y mayor a 0'

  if (form.body_fat_pct !== '') {
    const bf = Number(form.body_fat_pct)
    if (bf < 0 || bf > 100) errors.body_fat_pct = 'Entre 0 y 100%'
  }

  if (form.daily_steps !== '') {
    const steps = Number(form.daily_steps)
    if (Number.isNaN(steps) || steps < 0 || steps > 30000) errors.daily_steps = 'Entre 0 y 30000'
  }

  if (form.trainer_notes.length > 500) errors.trainer_notes = 'Máximo 500 caracteres'

  if (!form.joined_date) errors.joined_date = 'Fecha requerida'
  else if (form.joined_date > today) errors.joined_date = 'No puede ser en el futuro'

  return errors
}

export function CreateClientModal({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) return null

  function close() {
    onOpenChange(false)
    setForm(defaultForm)
    setErrors({})
    setServerError(null)
  }

  function set(field: keyof typeof defaultForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function handleSubmit() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const phase = form.phase
    if (!phase) {
      setErrors((prev) => ({ ...prev, phase: 'La fase es obligatoria' }))
      return
    }
    setServerError(null)
    startTransition(async () => {
      const result = await createClientAction({
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phase,
        objective: form.objective || null,
        weight_kg: Number(form.weight_kg),
        body_fat_pct: form.body_fat_pct !== '' ? Number(form.body_fat_pct) : null,
        age: form.age !== '' ? Number(form.age) : null,
        height_cm: form.height_cm !== '' ? Number(form.height_cm) : null,
        lifestyle: form.lifestyle || null,
        training_days: form.training_days || null,
        activity_level: form.activity_level,
        daily_steps: form.daily_steps !== '' ? Number(form.daily_steps) : 0,
        target_weight_kg: form.target_weight_kg !== '' ? Number(form.target_weight_kg) : null,
        joined_date: form.joined_date,
        trainer_notes: form.trainer_notes || null,
      })
      if (result.success) {
        router.refresh()
        close()
      } else {
        setServerError(result.error ?? 'Error al crear el cliente')
      }
    })
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={close} aria-hidden="true" />

      {/* Dialog */}
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-[var(--bg-surface)] rounded-lg w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl pointer-events-auto border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Nuevo cliente</h2>
            <button onClick={close} className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {serverError && (
              <div className="bg-[var(--danger)]/8 border border-[var(--danger)]/25 rounded-md px-4 py-3">
                <p className="text-sm text-[var(--danger)]">{serverError}</p>
              </div>
            )}

            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="cliente@email.com" className={inputCls} />
              {errors.email && <p className="text-xs text-[var(--danger)] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={labelCls}>Nombre completo *</label>
              <input type="text" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Juan García" className={inputCls} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
              {errors.full_name && <p className="text-xs text-[var(--danger)] mt-1">{errors.full_name}</p>}
            </div>

            <p className={sectionCls}>Datos personales</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Edad</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={16}
                  max={80}
                  value={form.age}
                  onChange={(e) => set('age', e.target.value)}
                  placeholder="—"
                  className={inputCls}
                />
                {errors.age && <p className="text-xs text-[var(--danger)] mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className={labelCls}>Altura en cm</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={140}
                  max={220}
                  step={0.5}
                  value={form.height_cm}
                  onChange={(e) => set('height_cm', e.target.value)}
                  placeholder="—"
                  className={inputCls}
                />
                {errors.height_cm && <p className="text-xs text-[var(--danger)] mt-1">{errors.height_cm}</p>}
              </div>
            </div>

            <p className={sectionCls}>Fase</p>
            <div>
              <label className={labelCls}>Fase *</label>
              <CustomSelect
                options={phaseOptions}
                value={form.phase}
                onChange={(v) => set('phase', v)}
                placeholder="Selecciona una fase"
              />
              {errors.phase && <p className="text-xs text-[var(--danger)] mt-1">{errors.phase}</p>}
            </div>

            <p className={sectionCls}>Objetivo</p>
            <div>
              <label className={labelCls}>Objetivo</label>
              <CustomSelect
                options={[{ value: '', label: 'Sin definir' }, ...objectiveOptions]}
                value={form.objective}
                onChange={(v) => set('objective', v)}
              />
            </div>

            <p className={sectionCls}>Estilo de vida</p>
            <div>
              <label className={labelCls}>Estilo de vida</label>
              <CustomSelect
                options={[{ value: '', label: 'Sin definir' }, ...lifestyleOptions]}
                value={form.lifestyle}
                onChange={(v) => set('lifestyle', v)}
              />
            </div>

            <p className={sectionCls}>Entrenamiento</p>
            <div>
              <label className={labelCls}>Frecuencia de entrenamiento</label>
              <CustomSelect
                options={[{ value: '', label: 'Sin definir' }, ...trainingDaysOptions]}
                value={form.training_days}
                onChange={(v) => set('training_days', v)}
              />
            </div>

            <p className={sectionCls}>Pasos diarios</p>
            <div>
              <label className={labelCls}>Pasos diarios</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={30000}
                step={500}
                value={form.daily_steps}
                onChange={(e) => set('daily_steps', e.target.value)}
                placeholder="8000"
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
                value={form.trainer_notes}
                onChange={(e) => set('trainer_notes', e.target.value)}
                placeholder="Observaciones, lesiones, preferencias..."
                className={`${inputCls} resize-none`}
              />
              <p className="text-[10px] text-[#a0a0a0] mt-1">{form.trainer_notes.length}/500</p>
              {errors.trainer_notes && <p className="text-xs text-[var(--danger)] mt-1">{errors.trainer_notes}</p>}
            </div>

            <p className={sectionCls}>Composición corporal</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Peso actual (kg) *</label>
                <input type="number" inputMode="decimal" step="0.1" value={form.weight_kg} onChange={(e) => set('weight_kg', e.target.value)} placeholder="75.0" className={inputCls} />
                {errors.weight_kg && <p className="text-xs text-[var(--danger)] mt-1">{errors.weight_kg}</p>}
              </div>
              <div>
                <label className={labelCls}>% Grasa corporal</label>
                <input type="number" inputMode="decimal" step="0.1" value={form.body_fat_pct} onChange={(e) => set('body_fat_pct', e.target.value)} placeholder="—" className={inputCls} />
                {errors.body_fat_pct && <p className="text-xs text-[var(--danger)] mt-1">{errors.body_fat_pct}</p>}
              </div>
            </div>

            <p className={sectionCls}>Compatibilidad</p>
            <div>
              <label className={labelCls}>Nivel de actividad (legacy)</label>
              <CustomSelect
                options={activityOptions}
                value={form.activity_level}
                onChange={(v) => set('activity_level', v)}
              />
            </div>

            <div>
              <label className={labelCls}>Peso objetivo (kg)</label>
              <input type="number" inputMode="decimal" step="0.1" value={form.target_weight_kg} onChange={(e) => set('target_weight_kg', e.target.value)} placeholder="—" className={inputCls} />
            </div>

            <p className={sectionCls}>Alta del cliente</p>
            <div>
              <label className={labelCls}>Fecha de ingreso *</label>
              <input type="date" value={form.joined_date} max={today} onChange={(e) => set('joined_date', e.target.value)} className={inputCls} />
              {errors.joined_date && <p className="text-xs text-[var(--danger)] mt-1">{errors.joined_date}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3 flex-shrink-0">
            <Button variant="ghost" size="md" onClick={close} className="flex-1" disabled={pending}>
              Cancelar
            </Button>
            <Button size="md" onClick={handleSubmit} disabled={pending} className="flex-1">
              {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando…</> : 'Crear cliente'}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
