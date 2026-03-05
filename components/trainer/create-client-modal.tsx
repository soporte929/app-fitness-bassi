'use client'

import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { createClientAction } from '@/app/(trainer)/clients/actions'
import type { ActivityLevel, Phase, Goal } from '@/lib/supabase/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const phaseOptions: { value: Phase; label: string }[] = [
  { value: 'deficit', label: 'Déficit' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'surplus', label: 'Superávit' },
]

const goalOptions: { value: Goal; label: string }[] = [
  { value: 'deficit', label: 'Perder grasa' },
  { value: 'maintenance', label: 'Mantener' },
  { value: 'surplus', label: 'Ganar masa' },
]

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'light', label: 'Ligero (1–2 días/sem)' },
  { value: 'moderate', label: 'Moderado (3–5 días/sem)' },
  { value: 'active', label: 'Activo (6–7 días/sem)' },
  { value: 'very_active', label: 'Muy activo' },
]

const inputCls =
  'w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all'

const today = new Date().toISOString().split('T')[0]

const defaultForm = {
  email: '',
  full_name: '',
  phase: 'maintenance' as Phase,
  goal: 'maintenance' as Goal,
  weight_kg: '',
  body_fat_pct: '',
  activity_level: 'moderate' as ActivityLevel,
  daily_steps: '8000',
  target_weight_kg: '',
  joined_date: today,
  notes: '',
}

type FormErrors = Partial<Record<keyof typeof defaultForm, string>>

function validate(form: typeof defaultForm): FormErrors {
  const errors: FormErrors = {}
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Email inválido'
  if (form.full_name.trim().length < 3) errors.full_name = 'Mínimo 3 caracteres'
  const w = Number(form.weight_kg)
  if (!form.weight_kg || w <= 0) errors.weight_kg = 'Peso requerido y mayor a 0'
  if (form.body_fat_pct !== '') {
    const bf = Number(form.body_fat_pct)
    if (bf < 0 || bf > 100) errors.body_fat_pct = 'Entre 0 y 100%'
  }
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
    setServerError(null)
    startTransition(async () => {
      const result = await createClientAction({
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phase: form.phase,
        goal: form.goal,
        weight_kg: Number(form.weight_kg),
        body_fat_pct: form.body_fat_pct !== '' ? Number(form.body_fat_pct) : null,
        activity_level: form.activity_level,
        daily_steps: Number(form.daily_steps) || 0,
        target_weight_kg: form.target_weight_kg !== '' ? Number(form.target_weight_kg) : null,
        joined_date: form.joined_date,
        notes: form.notes || null,
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
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="cliente@email.com" className={inputCls} />
              {errors.email && <p className="text-xs text-[var(--danger)] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Nombre completo *</label>
              <input type="text" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Juan García" className={inputCls} />
              {errors.full_name && <p className="text-xs text-[var(--danger)] mt-1">{errors.full_name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Fase</label>
                <select value={form.phase} onChange={(e) => set('phase', e.target.value)} className={inputCls}>
                  {phaseOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Objetivo</label>
                <select value={form.goal} onChange={(e) => set('goal', e.target.value)} className={inputCls}>
                  {goalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Peso actual (kg) *</label>
                <input type="number" inputMode="decimal" step="0.1" value={form.weight_kg} onChange={(e) => set('weight_kg', e.target.value)} placeholder="75.0" className={inputCls} />
                {errors.weight_kg && <p className="text-xs text-[var(--danger)] mt-1">{errors.weight_kg}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">% Grasa corporal</label>
                <input type="number" inputMode="decimal" step="0.1" value={form.body_fat_pct} onChange={(e) => set('body_fat_pct', e.target.value)} placeholder="—" className={inputCls} />
                {errors.body_fat_pct && <p className="text-xs text-[var(--danger)] mt-1">{errors.body_fat_pct}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Nivel de actividad</label>
              <select value={form.activity_level} onChange={(e) => set('activity_level', e.target.value)} className={inputCls}>
                {activityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Pasos diarios</label>
                <input type="number" inputMode="numeric" step="500" value={form.daily_steps} onChange={(e) => set('daily_steps', e.target.value)} placeholder="8000" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Peso objetivo (kg)</label>
                <input type="number" inputMode="decimal" step="0.1" value={form.target_weight_kg} onChange={(e) => set('target_weight_kg', e.target.value)} placeholder="—" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Fecha de ingreso *</label>
              <input type="date" value={form.joined_date} max={today} onChange={(e) => set('joined_date', e.target.value)} className={inputCls} />
              {errors.joined_date && <p className="text-xs text-[var(--danger)] mt-1">{errors.joined_date}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Notas</label>
              <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Observaciones iniciales..." className={`${inputCls} resize-none`} />
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
