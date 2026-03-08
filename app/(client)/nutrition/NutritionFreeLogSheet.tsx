'use client'

import { useMemo, useState, useTransition } from 'react'
import { Loader2, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { createNutritionFreeLogAction } from './free-log-actions'

type NutritionFreeLogSheetProps = {
  clientId: string
}

type FormState = {
  foodName: string
  grams: string
  calories: string
  proteinG: string
  carbsG: string
  fatG: string
}

const defaultForm: FormState = {
  foodName: '',
  grams: '',
  calories: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
}

const inputClass =
  'w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.16)]'

const labelClass = 'text-xs text-[var(--text-muted)] mb-1 block'

function parseOptionalNumber(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return null
  return parsed
}

export function NutritionFreeLogSheet({ clientId }: NutritionFreeLogSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [inlineMessage, setInlineMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const parsedValues = useMemo(
    () => ({
      grams: parseOptionalNumber(form.grams),
      calories: parseOptionalNumber(form.calories),
      proteinG: parseOptionalNumber(form.proteinG),
      carbsG: parseOptionalNumber(form.carbsG),
      fatG: parseOptionalNumber(form.fatG),
    }),
    [form]
  )

  const hasNegativeValues = Object.values(parsedValues).some((value) => value != null && value < 0)

  const closeSheet = () => {
    setIsOpen(false)
    setShowMore(false)
    setError(null)
  }

  const resetForm = () => {
    setForm(defaultForm)
    setError(null)
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setInlineMessage(null)
    setError(null)
  }

  const handleSubmit = () => {
    if (!clientId) {
      setError('No se pudo identificar al cliente')
      return
    }

    if (!form.foodName.trim()) {
      setError('El nombre de la comida es obligatorio')
      return
    }

    if (hasNegativeValues) {
      setError('Los valores no pueden ser negativos')
      return
    }

    startTransition(async () => {
      const result = await createNutritionFreeLogAction({
        clientId,
        foodName: form.foodName.trim(),
        grams: parsedValues.grams,
        calories: parsedValues.calories,
        proteinG: parsedValues.proteinG,
        carbsG: parsedValues.carbsG,
        fatG: parsedValues.fatG,
      })

      if (!result.success) {
        setError(result.error ?? result.message)
        return
      }

      setInlineMessage(result.message)
      resetForm()
      closeSheet()
    })
  }

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Añadir comida"
        className="fixed z-50 flex items-center justify-center rounded-full shadow-xl transition-transform active:scale-95 hover:brightness-110"
        style={{
          bottom: 80,
          right: 16,
          width: 56,
          height: 56,
          background: 'var(--accent)',
        }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Overlay + Bottom Sheet */}
      <div
        className={`fixed inset-0 z-[80] transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeSheet}
      >
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Registro libre de comida"
          className={`absolute bottom-0 left-0 right-0 mx-auto max-w-[430px] rounded-t-2xl flex flex-col transition-transform duration-300 ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '85vh', background: 'var(--bg-elevated)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — fuera del scroll */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Añadir comida</h3>
            <button
              type="button"
              onClick={closeSheet}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Campos — scrollable */}
          <div className="overflow-y-auto flex-1 px-5 pb-3">
            <div className="space-y-3">
              {/* Obligatorio: Nombre */}
              <div>
                <label className={labelClass}>Nombre *</label>
                <input
                  type="text"
                  value={form.foodName}
                  onChange={(e) => setField('foodName', e.target.value)}
                  placeholder="Ej: Ensalada con pollo"
                  className={inputClass}
                  autoFocus
                />
              </div>

              {/* Obligatorios: Kcal + Proteína */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kcal *</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.calories}
                    onChange={(e) => setField('calories', e.target.value)}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>Proteína (g) *</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.proteinG}
                    onChange={(e) => setField('proteinG', e.target.value)}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Toggle: Más detalles */}
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] py-1 transition-opacity hover:opacity-80"
              >
                {showMore ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {showMore ? 'Menos detalles' : 'Más detalles'}
              </button>

              {/* Opcionales: Gramos, Carbos, Grasa */}
              {showMore && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Gramos</label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={form.grams}
                        onChange={(e) => setField('grams', e.target.value)}
                        className={inputClass}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Carbos (g)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={form.carbsG}
                        onChange={(e) => setField('carbsG', e.target.value)}
                        className={inputClass}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Grasa (g)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={form.fatG}
                      onChange={(e) => setField('fatG', e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
            </div>
          </div>

          {/* Botón Guardar — fijo fuera del scroll */}
          <div
            className="flex-shrink-0 px-5 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar comida'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
