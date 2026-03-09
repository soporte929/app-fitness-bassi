'use client'

import { useState, useTransition } from 'react'
import { Search, Plus, Trash2, ChefHat } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { saveDishAction } from './actions'
import type { Database } from '@/lib/supabase/types'

type Food = Database['public']['Tables']['foods']['Row']

interface DishIngredient {
  food: Food
  grams: number
}

interface CreateDishFormProps {
  foods: Food[]
  trainerId: string
}

function calcMacros(ingredients: DishIngredient[]) {
  let kcal = 0
  let protein = 0
  let carbs = 0
  let fat = 0
  let totalGrams = 0

  for (const { food, grams } of ingredients) {
    const factor = grams / 100
    kcal += food.kcal_per_100g * factor
    protein += food.protein_per_100g * factor
    carbs += food.carbs_per_100g * factor
    fat += food.fat_per_100g * factor
    totalGrams += grams
  }

  // Normalize to per-100g values (used for DB storage)
  const per100 = totalGrams > 0 ? 100 / totalGrams : 0
  return {
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    totalGrams,
    kcal_per_100g: parseFloat((kcal * per100).toFixed(2)),
    protein_per_100g: parseFloat((protein * per100).toFixed(2)),
    carbs_per_100g: parseFloat((carbs * per100).toFixed(2)),
    fat_per_100g: parseFloat((fat * per100).toFixed(2)),
  }
}

export function CreateDishForm({ foods, trainerId }: CreateDishFormProps) {
  const [dishName, setDishName] = useState('')
  const [query, setQuery] = useState('')
  const [ingredients, setIngredients] = useState<DishIngredient[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredFoods = query.trim().length > 0
    ? foods.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.category.toLowerCase().includes(query.toLowerCase())
      )
    : []

  function addIngredient(food: Food) {
    setIngredients((prev) => {
      const existing = prev.find((i) => i.food.id === food.id)
      if (existing) return prev
      return [...prev, { food, grams: 100 }]
    })
    setQuery('')
  }

  function updateGrams(foodId: string, grams: number) {
    setIngredients((prev) =>
      prev.map((i) => (i.food.id === foodId ? { ...i, grams } : i))
    )
  }

  function removeIngredient(foodId: string) {
    setIngredients((prev) => prev.filter((i) => i.food.id !== foodId))
  }

  const macros = calcMacros(ingredients)

  function handleSave() {
    setError(null)
    setSuccess(null)

    if (!dishName.trim()) {
      setError('El plato necesita un nombre.')
      return
    }
    if (ingredients.length === 0) {
      setError('Añade al menos un alimento al plato.')
      return
    }

    startTransition(async () => {
      const result = await saveDishAction({
        trainerId,
        name: dishName.trim(),
        kcal_per_100g: macros.kcal_per_100g,
        protein_per_100g: macros.protein_per_100g,
        carbs_per_100g: macros.carbs_per_100g,
        fat_per_100g: macros.fat_per_100g,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`"${dishName.trim()}" guardado correctamente.`)
        setDishName('')
        setIngredients([])
      }
    })
  }

  return (
    <Card className="bg-[var(--bg-surface)] border border-[var(--border)] p-5 rounded-2xl space-y-5">
      {/* Dish name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Nombre del plato
        </label>
        <input
          type="text"
          placeholder="Ej. Pollo con arroz y verduras"
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
        />
      </div>

      {/* Food search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Buscar alimento
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Search results dropdown */}
        {filteredFoods.length > 0 && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {filteredFoods.slice(0, 8).map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => addIngredient(food)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--bg-surface)] transition-colors text-left"
              >
                <div>
                  <span className="font-medium text-[var(--text-primary)]">{food.name}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{food.category}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{food.kcal_per_100g} kcal/100g</span>
                  <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ingredient list */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-primary)]">
            Ingredientes
          </label>
          <div className="space-y-2">
            {ingredients.map(({ food, grams }) => (
              <div
                key={food.id}
                className="flex items-center gap-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-3 py-2"
              >
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">
                  {food.name}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    className="w-16 h-8 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-sm text-[var(--text-primary)] text-right focus:outline-none focus:border-[var(--accent)]"
                    value={grams}
                    onChange={(e) => updateGrams(food.id, Math.max(1, Number(e.target.value)))}
                  />
                  <span className="text-xs text-[var(--text-muted)] w-5">g</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(food.id)}
                  className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live macro tally */}
      {ingredients.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Macros totales del plato ({macros.totalGrams}g)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-[#F5C518]">{macros.kcal}</p>
              <p className="text-xs text-[var(--text-muted)]">kcal</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-400">{macros.protein}g</p>
              <p className="text-xs text-[var(--text-muted)]">Proteína</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">{macros.carbs}g</p>
              <p className="text-xs text-[var(--text-muted)]">Carbos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-400">{macros.fat}g</p>
              <p className="text-xs text-[var(--text-muted)]">Grasa</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Por 100g: {macros.kcal_per_100g} kcal · {macros.protein_per_100g}g P ·{' '}
              {macros.carbs_per_100g}g C · {macros.fat_per_100g}g G
            </p>
          </div>
        </div>
      )}

      {/* Error / success */}
      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-400 font-medium">{success}</p>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:brightness-110 text-black font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ChefHat className="w-4 h-4" />
        {isPending ? 'Guardando...' : 'Guardar plato'}
      </button>
    </Card>
  )
}
