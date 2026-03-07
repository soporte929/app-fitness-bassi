'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createNutritionLogAction } from './actions'

type Props = {
  clientId: string
}

type FormState = {
  mealName: string
  grams: string
  kcal: string
  proteinG: string
  carbsG: string
  fatG: string
}

const inputClass =
  'w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]'

const labelClass = 'text-xs text-[#a0a0a0] mb-1 block'

const defaultForm: FormState = {
  mealName: '',
  grams: '',
  kcal: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
}

function parseOptionalNumber(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function AddMealFab({ clientId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const close = () => {
    setOpen(false)
    setForm(defaultForm)
    setError(null)
  }

  const handleAdd = () => {
    if (form.mealName.trim().length === 0) {
      setError('El nombre es obligatorio')
      return
    }

    const kcalValue = parseOptionalNumber(form.kcal)
    const proteinValue = parseOptionalNumber(form.proteinG)
    const carbsValue = parseOptionalNumber(form.carbsG)
    const fatValue = parseOptionalNumber(form.fatG)

    if (
      (kcalValue != null && kcalValue < 0) ||
      (proteinValue != null && proteinValue < 0) ||
      (carbsValue != null && carbsValue < 0) ||
      (fatValue != null && fatValue < 0)
    ) {
      setError('Los valores no pueden ser negativos')
      return
    }

    startTransition(async () => {
      const result = await createNutritionLogAction({
        clientId,
        mealName: form.mealName.trim(),
        kcal: form.kcal,
        proteinG: form.proteinG,
        carbsG: form.carbsG,
        fatG: form.fatG,
      })

      if (!result.success) {
        setError(result.error ?? 'No se pudo añadir la comida')
        return
      }

      close()
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Añadir comida"
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#6b7fa3] text-white shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full rounded-t-2xl p-6 pb-10"
            style={{
              background: '#212121',
              maxWidth: '430px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#e8e8e6]">Registrar comida</h3>
              <button
                type="button"
                onClick={close}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#a0a0a0] hover:bg-[rgba(255,255,255,0.06)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#a0a0a0] mb-5">
              Introduce los valores totales, o valores por 100g especificando los gramos abajo.
            </p>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  required
                  value={form.mealName}
                  onChange={(event) => setField('mealName', event.target.value)}
                  placeholder="Ej: Pollo con arroz"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Gramos (opcional)</label>
                <input
                  type="number"
                  min={0}
                  value={form.grams}
                  onChange={(event) => setField('grams', event.target.value)}
                  placeholder="Ej: 200"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kcal</label>
                  <input
                    type="number"
                    min={0}
                    value={form.kcal}
                    onChange={(event) => setField('kcal', event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Proteína (g)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.proteinG}
                    onChange={(event) => setField('proteinG', event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Carbos (g)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.carbsG}
                    onChange={(event) => setField('carbsG', event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Grasa (g)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.fatG}
                    onChange={(event) => setField('fatG', event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-[var(--danger)] mt-3">{error}</p>}

            <button
              type="button"
              onClick={handleAdd}
              disabled={pending}
              className="w-full mt-5 rounded-xl px-4 py-3 bg-[#6b7fa3] text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
