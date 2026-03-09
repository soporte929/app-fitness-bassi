'use client'

import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { Search, Plus, Trash2, ChefHat } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Food = Database['public']['Tables']['foods']['Row']
type SavedDish = Database['public']['Tables']['saved_dishes']['Row']

// A unified item that can be either a food or a dish
type SearchableItem =
  | { kind: 'food'; food: Food }
  | { kind: 'dish'; dish: SavedDish }

interface SelectedItem {
  id: string
  kind: 'food' | 'dish'
  name: string
  grams: number
  kcal_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

interface MealSlotProps {
  mealNumber: number
  dietType: 'A' | 'B'
  targetMacros: {
    protein: number
    carbs: number
    fat: number
    kcal: number
  }
  foods: Food[]
  dishes: SavedDish[]
}

function calcSlotMacros(items: SelectedItem[]) {
  let kcal = 0
  let protein = 0
  let carbs = 0
  let fat = 0
  for (const item of items) {
    const f = item.grams / 100
    kcal += item.kcal_per_100g * f
    protein += item.protein_per_100g * f
    carbs += item.carbs_per_100g * f
    fat += item.fat_per_100g * f
  }
  return {
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  }
}

function FoodSearchSlot({
  foods,
  dishes,
  optionLabel,
}: {
  foods: Food[]
  dishes: SavedDish[]
  optionLabel?: string
}) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SelectedItem[]>([])

  const allSearchable: SearchableItem[] = [
    ...foods.map((f): SearchableItem => ({ kind: 'food', food: f })),
    ...dishes.map((d): SearchableItem => ({ kind: 'dish', dish: d })),
  ]

  const filtered = query.trim().length > 0
    ? allSearchable.filter((s) => {
        const name = s.kind === 'food' ? s.food.name : s.dish.name
        return name.toLowerCase().includes(query.toLowerCase())
      })
    : []

  function addItem(searchable: SearchableItem) {
    const id = searchable.kind === 'food' ? searchable.food.id : searchable.dish.id
    if (items.some((i) => i.id === id && i.kind === searchable.kind)) return

    const newItem: SelectedItem =
      searchable.kind === 'food'
        ? {
            id: searchable.food.id,
            kind: 'food',
            name: searchable.food.name,
            grams: 100,
            kcal_per_100g: searchable.food.kcal_per_100g,
            protein_per_100g: searchable.food.protein_per_100g,
            carbs_per_100g: searchable.food.carbs_per_100g,
            fat_per_100g: searchable.food.fat_per_100g,
          }
        : {
            id: searchable.dish.id,
            kind: 'dish',
            name: searchable.dish.name,
            grams: 100,
            kcal_per_100g: searchable.dish.kcal_per_100g,
            protein_per_100g: searchable.dish.protein_per_100g,
            carbs_per_100g: searchable.dish.carbs_per_100g,
            fat_per_100g: searchable.dish.fat_per_100g,
          }

    setItems((prev) => [...prev, newItem])
    setQuery('')
  }

  function updateGrams(id: string, kind: 'food' | 'dish', grams: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.kind === kind ? { ...i, grams } : i))
    )
  }

  function removeItem(id: string, kind: 'food' | 'dish') {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.kind === kind)))
  }

  const macros = calcSlotMacros(items)

  return (
    <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hover)] space-y-3">
      {optionLabel && (
        <p className="font-medium text-sm text-[var(--text-primary)]">{optionLabel}</p>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Buscar alimento o plato guardado..."
          className="flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] pl-8 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results */}
      {filtered.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl overflow-hidden max-h-40 overflow-y-auto">
          {filtered.slice(0, 6).map((s) => {
            const id = s.kind === 'food' ? s.food.id : s.dish.id
            const name = s.kind === 'food' ? s.food.name : s.dish.name
            const kcal = s.kind === 'food' ? s.food.kcal_per_100g : s.dish.kcal_per_100g
            return (
              <button
                key={`${s.kind}-${id}`}
                type="button"
                onClick={() => addItem(s)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[var(--bg-surface)] transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {s.kind === 'dish' && (
                    <ChefHat className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
                  )}
                  <span className="font-medium text-[var(--text-primary)] truncate">{name}</span>
                  {s.kind === 'food' && (
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{s.food.category}</span>
                  )}
                  {s.kind === 'dish' && (
                    <span className="text-xs text-[var(--accent)] flex-shrink-0">plato</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] flex-shrink-0">
                  <span>{kcal} kcal/100g</span>
                  <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected items */}
      {items.map((item) => (
        <div
          key={`${item.kind}-${item.id}`}
          className="flex items-center gap-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-3 py-2"
        >
          {item.kind === 'dish' && (
            <ChefHat className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
          )}
          <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">
            {item.name}
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="2000"
              className="w-16 h-7 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-sm text-[var(--text-primary)] text-right focus:outline-none focus:border-[var(--accent)]"
              value={item.grams}
              onChange={(e) => updateGrams(item.id, item.kind, Math.max(1, Number(e.target.value)))}
            />
            <span className="text-xs text-[var(--text-muted)] w-5">g</span>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id, item.kind)}
            className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Accumulated macros for this option */}
      {items.length > 0 && (
        <div className="flex gap-4 text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
          <span className="font-medium text-[#F5C518]">{macros.kcal} kcal</span>
          <span>
            <span className="text-blue-400 font-medium">{macros.protein}g</span> P
          </span>
          <span>
            <span className="text-green-400 font-medium">{macros.carbs}g</span> C
          </span>
          <span>
            <span className="text-red-400 font-medium">{macros.fat}g</span> G
          </span>
        </div>
      )}
    </div>
  )
}

export function MealSlot({ mealNumber, dietType, targetMacros, foods, dishes }: MealSlotProps) {
  const [options, setOptions] = useState([{ id: 1, label: 'Opción A' }])

  const addOption = () => {
    if (options.length < 3) {
      const labels = ['Opción A', 'Opción B', 'Opción C']
      setOptions((prev) => [...prev, { id: prev.length + 1, label: labels[prev.length] }])
    }
  }

  return (
    <Card className="p-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-[var(--text-primary)]">Comida {mealNumber}</h3>
        <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
          <span>{targetMacros.protein}g P</span>
          <span>{targetMacros.carbs}g C</span>
          <span>{targetMacros.fat}g G</span>
          <span className="font-bold text-[var(--text-primary)]">{targetMacros.kcal} kcal</span>
        </div>
      </div>

      {dietType === 'A' ? (
        <FoodSearchSlot foods={foods} dishes={dishes} />
      ) : (
        <div className="space-y-4">
          {options.map((opt) => (
            <FoodSearchSlot
              key={opt.id}
              foods={foods}
              dishes={dishes}
              optionLabel={opt.label}
            />
          ))}
          {options.length < 3 && (
            <button
              onClick={addOption}
              className="text-sm font-medium text-[var(--accent)] hover:underline"
              type="button"
            >
              + Añadir Alternativa
            </button>
          )}
        </div>
      )}
    </Card>
  )
}
