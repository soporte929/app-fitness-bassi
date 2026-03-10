'use client'

import React, { useState } from 'react'
import { logPlannedMealAction } from '@/app/(client)/nutrition/actions'
import { Database } from '@/lib/supabase/types'

type ActivePlan = Database['public']['Tables']['nutrition_plans']['Row'] & {
    meals: Database['public']['Tables']['nutrition_plan_meals']['Row'][]
    items: (Database['public']['Tables']['meal_plan_items']['Row'] & {
        food: Database['public']['Tables']['foods']['Row'] | null
        dish: Database['public']['Tables']['saved_dishes']['Row'] | null
    })[]
}

interface ClientDailyMealsProps {
    clientId: string
    dateStr: string
    plan: ActivePlan | null
    logs: any[]
}

export function ClientDailyMeals({ clientId, dateStr, plan, logs }: ClientDailyMealsProps) {
    const [loadingMeals, setLoadingMeals] = useState<Record<number, boolean>>({})
    const [activeOptions, setActiveOptions] = useState<Record<string, string>>({}) // key: meal_number, value: option_slot
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({}) // key: item.id, value: checked

    if (!plan) return null

    // If Type C, just show daily macros summary
    if (plan.diet_type === 'C') {
        return (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-5 mb-6 text-center">
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Dieta Flexible (Macros Libres)</p>
                <p className="text-xs text-[var(--text-muted)]">Tienes libertad para estructurar tus comidas como prefieras, respetando tus macros diarios.</p>
            </div>
        )
    }

    const meals = [...(plan.meals || [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    const items = plan.items || []

    const toggleItem = (itemId: string) => {
        setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }))
    }

    const handleLogMeal = async (mealNumber: number, activeItems: typeof items) => {
        // If any item is explicitly checked, only log checked items; otherwise log all active items
        const hasAnyChecked = activeItems.some(i => checkedItems[i.id])
        const itemsToLog = hasAnyChecked
            ? activeItems.filter(i => checkedItems[i.id])
            : activeItems

        if (itemsToLog.length === 0) return

        setLoadingMeals(prev => ({ ...prev, [mealNumber]: true }))
        try {
            await logPlannedMealAction(clientId, dateStr, mealNumber, itemsToLog.map(i => ({
                foodId: i.food_id,
                dishId: i.dish_id,
                grams: i.grams
            })))
        } finally {
            setLoadingMeals(prev => ({ ...prev, [mealNumber]: false }))
        }
    }

    const toggleOption = (mealNumber: number, currentOption: string | null, availableOptions: (string | null)[]) => {
        const defaultOpt = currentOption || 'A'
        const currentIndex = availableOptions.indexOf(defaultOpt)
        const nextIndex = (currentIndex + 1) % availableOptions.length
        setActiveOptions(prev => ({
            ...prev,
            [`${mealNumber}`]: availableOptions[nextIndex] || 'A'
        }))
    }

    return (
        <div className="space-y-4 mb-6">
            {meals.map((meal, index) => {
                const mealNumber = meal.order_index ?? (index + 1)
                const isLogged = logs.some(l => l.meal_number === mealNumber)

                const mealItems = items.filter(i => i.meal_number === mealNumber)

                const availableOptions = Array.from(new Set(mealItems.map(i => i.option_slot || 'A'))).sort()
                const currentOption = activeOptions[`${mealNumber}`] || availableOptions[0] || 'A'

                const activeItems = mealItems.filter(i => (i.option_slot || 'A') === currentOption)

                let totalKcal = 0
                let totalProtein = 0
                let totalCarbs = 0
                let totalFat = 0

                activeItems.forEach(item => {
                    const source = item.food || item.dish
                    if (source) {
                        const factor = item.grams / 100
                        totalKcal += (source.kcal_per_100g * factor)
                        totalProtein += (source.protein_per_100g * factor)
                        totalCarbs += (source.carbs_per_100g * factor)
                        totalFat += (source.fat_per_100g * factor)
                    }
                })

                const hasAnyChecked = activeItems.some(i => checkedItems[i.id])
                const allChecked = activeItems.length > 0 && activeItems.every(i => checkedItems[i.id])

                return (
                    <div key={meal.id} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                        {/* Meal header */}
                        <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{meal.name}</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    {Math.round(totalKcal)} kcal · {Math.round(totalProtein)}g P · {Math.round(totalCarbs)}g C · {Math.round(totalFat)}g G
                                </p>
                            </div>
                            {availableOptions.length > 1 && !isLogged && (
                                <button
                                    onClick={() => toggleOption(mealNumber, currentOption, availableOptions)}
                                    className="text-xs font-medium text-[#fb8500] bg-[#fb8500]/10 px-2.5 py-1.5 rounded-md active:bg-[#fb8500]/20 transition-colors flex items-center gap-1"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                    Opción {currentOption}
                                </button>
                            )}
                        </div>

                        {/* Food items as checkboxes */}
                        <div className="px-4 py-3 space-y-1">
                            {activeItems.map(item => {
                                const source = item.food || item.dish
                                if (!source) return null

                                const isChecked = !!checkedItems[item.id]
                                const factor = item.grams / 100
                                const itemProtein = source.protein_per_100g * factor
                                const itemCarbs = source.carbs_per_100g * factor
                                const itemFat = source.fat_per_100g * factor

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => !isLogged && toggleItem(item.id)}
                                        disabled={isLogged}
                                        className={[
                                            'w-full flex items-start gap-3 py-2.5 px-2 rounded-lg text-left transition-colors',
                                            isLogged
                                                ? 'cursor-default'
                                                : 'active:bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-elevated)]/50',
                                        ].join(' ')}
                                    >
                                        {/* Checkbox visual */}
                                        <div className={[
                                            'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                            isChecked || isLogged
                                                ? 'bg-[var(--accent)] border-[var(--accent)]'
                                                : 'border-[var(--border)] bg-transparent',
                                        ].join(' ')}>
                                            {(isChecked || isLogged) && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Food info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={[
                                                'text-sm font-medium leading-snug',
                                                isChecked || isLogged
                                                    ? 'line-through text-[var(--text-muted)]'
                                                    : 'text-[var(--text-primary)]',
                                            ].join(' ')}>
                                                {source.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                {Math.round(itemProtein)}g P · {Math.round(itemCarbs)}g C · {Math.round(itemFat)}g G · {item.grams}g
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}

                            {/* Register button */}
                            <div className="pt-2">
                                {isLogged ? (
                                    <div className="w-full py-2 bg-[var(--bg-elevated)] border border-[var(--border)] text-center rounded-lg">
                                        <span className="text-xs font-medium text-[var(--text-muted)] flex items-center justify-center gap-1.5">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Registrado
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleLogMeal(mealNumber, activeItems)}
                                        disabled={loadingMeals[mealNumber] || activeItems.length === 0}
                                        className="w-full py-2 bg-white text-black font-medium text-xs rounded-lg active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {loadingMeals[mealNumber]
                                            ? 'Registrando...'
                                            : hasAnyChecked && !allChecked
                                                ? `Registrar selección (${activeItems.filter(i => checkedItems[i.id]).length}/${activeItems.length})`
                                                : 'Registrar comida'
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
