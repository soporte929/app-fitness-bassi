'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X } from 'lucide-react'
import { createNutritionTemplateAction } from './actions'

type MealFormState = {
  name: string
  kcalPer100g: string
  proteinPer100g: string
  carbsPer100g: string
  fatPer100g: string
  defaultGrams: string
  mealTime: string
}

const defaultMealState: MealFormState = {
  name: '',
  kcalPer100g: '',
  proteinPer100g: '',
  carbsPer100g: '',
  fatPer100g: '',
  defaultGrams: '',
  mealTime: '',
}

function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function CreateTemplateModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [kcalTarget, setKcalTarget] = useState('')
  const [proteinTarget, setProteinTarget] = useState('')
  const [carbsTarget, setCarbsTarget] = useState('')
  const [fatTarget, setFatTarget] = useState('')
  const [meals, setMeals] = useState<MealFormState[]>([{ ...defaultMealState }])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => name.trim().length > 0, [name])

  const addMeal = () => {
    setMeals((prev) => [...prev, { ...defaultMealState }])
  }

  const removeMeal = (index: number) => {
    setMeals((prev) => prev.filter((_, current) => current !== index))
  }

  const updateMeal = (index: number, field: keyof MealFormState, value: string) => {
    setMeals((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const resetForm = () => {
    setName('')
    setKcalTarget('')
    setProteinTarget('')
    setCarbsTarget('')
    setFatTarget('')
    setMeals([{ ...defaultMealState }])
    setError('')
  }

  const closeModal = () => {
    setIsOpen(false)
    resetForm()
  }

  const handleSave = () => {
    setError('')
    setSuccess('')

    if (!canSubmit) {
      setError('El nombre de la plantilla es obligatorio')
      return
    }

    const normalizedMeals = meals
      .map((meal, index) => ({
        name: meal.name.trim(),
        kcal_per_100g: toOptionalNumber(meal.kcalPer100g),
        protein_per_100g: toOptionalNumber(meal.proteinPer100g),
        carbs_per_100g: toOptionalNumber(meal.carbsPer100g),
        fat_per_100g: toOptionalNumber(meal.fatPer100g),
        default_grams: toOptionalNumber(meal.defaultGrams),
        meal_time: meal.mealTime.trim() ? meal.mealTime.trim() : null,
        order_index: index,
      }))
      .filter((meal) => meal.name.length > 0)

    startTransition(async () => {
      const result = await createNutritionTemplateAction({
        name: name.trim(),
        kcal_target: toOptionalNumber(kcalTarget),
        protein_target_g: toOptionalNumber(proteinTarget),
        carbs_target_g: toOptionalNumber(carbsTarget),
        fat_target_g: toOptionalNumber(fatTarget),
        meals: normalizedMeals,
      })

      if (!result.success) {
        setError(result.error ?? 'No se pudo crear la plantilla')
        return
      }

      setSuccess(result.message ?? 'Plantilla creada correctamente')
      setIsOpen(false)
      resetForm()
      router.refresh()
    })
  }

  return (
    <>
      {success && (
        <p className="mb-3 rounded-xl border border-[rgba(48,209,88,0.25)] bg-[rgba(48,209,88,0.10)] px-3 py-2 text-sm text-[#30d158]">
          {success}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setSuccess('')
          setError('')
          setIsOpen(true)
        }}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border border-[rgba(107,127,163,0.35)] bg-[rgba(107,127,163,0.15)] text-[#6b7fa3] hover:bg-[rgba(107,127,163,0.2)] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nueva plantilla
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#212121] p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold text-[#e8e8e6]">Crear plantilla</h2>
              <button
                type="button"
                onClick={closeModal}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#a0a0a0] hover:bg-[rgba(255,255,255,0.07)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="mb-4 rounded-xl border border-[rgba(255,69,58,0.22)] bg-[rgba(255,69,58,0.10)] px-3 py-2 text-sm text-[#ff9f9a]">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#a0a0a0] mb-1">Nombre de la plantilla</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Volumen 3000 kcal"
                  className="w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-[#a0a0a0] mb-1">Kcal objetivo</label>
                  <input
                    type="number"
                    min={0}
                    value={kcalTarget}
                    onChange={(event) => setKcalTarget(event.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#a0a0a0] mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={proteinTarget}
                    onChange={(event) => setProteinTarget(event.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#a0a0a0] mb-1">Carbos (g)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={carbsTarget}
                    onChange={(event) => setCarbsTarget(event.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#a0a0a0] mb-1">Grasa (g)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={fatTarget}
                    onChange={(event) => setFatTarget(event.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium tracking-wide uppercase text-[#6b7fa3]">Comidas</p>
                  <button
                    type="button"
                    onClick={addMeal}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border border-[rgba(255,255,255,0.08)] text-[#a0a0a0] hover:text-[#e8e8e6] hover:bg-[rgba(255,255,255,0.05)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir
                  </button>
                </div>

                <div className="space-y-3">
                  {meals.map((meal, index) => (
                    <div
                      key={`${index}-${meal.name}`}
                      className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-[#a0a0a0]">Comida #{index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeMeal(index)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-[#a0a0a0] hover:text-[#ff9f9a] hover:bg-[rgba(255,69,58,0.10)]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(event) => updateMeal(index, 'name', event.target.value)}
                          placeholder="Nombre comida"
                          className="w-full rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                        />
                        <input
                          type="text"
                          value={meal.mealTime}
                          onChange={(event) => updateMeal(index, 'mealTime', event.target.value)}
                          placeholder="Hora (ej: 08:00)"
                          className="w-full rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                        />
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={meal.kcalPer100g}
                          onChange={(event) => updateMeal(index, 'kcalPer100g', event.target.value)}
                          placeholder="Kcal / 100g"
                          className="w-full rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                        />
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={meal.proteinPer100g}
                          onChange={(event) => updateMeal(index, 'proteinPer100g', event.target.value)}
                          placeholder="Proteína / 100g"
                          className="w-full rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                        />
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={meal.carbsPer100g}
                          onChange={(event) => updateMeal(index, 'carbsPer100g', event.target.value)}
                          placeholder="Carbos / 100g"
                          className="w-full rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                        />
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={meal.fatPer100g}
                          onChange={(event) => updateMeal(index, 'fatPer100g', event.target.value)}
                          placeholder="Grasa / 100g"
                          className="w-full rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)]"
                        />
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={meal.defaultGrams}
                          onChange={(event) => updateMeal(index, 'defaultGrams', event.target.value)}
                          placeholder="Gramos default"
                          className="w-full rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)] md:col-span-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-4 py-2.5 text-sm font-medium border border-[rgba(255,255,255,0.08)] text-[#a0a0a0] hover:text-[#e8e8e6] hover:bg-[rgba(255,255,255,0.05)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending || !canSubmit}
                onClick={handleSave}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#6b7fa3] text-white disabled:opacity-60"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  'Crear plantilla'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
