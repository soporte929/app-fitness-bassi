'use client'

import { Card } from '@/components/ui/card'
import { useState } from 'react'

interface MealSlotProps {
    mealNumber: number
    dietType: 'A' | 'B'
    targetMacros: {
        protein: number
        carbs: number
        fat: number
        kcal: number
    }
}

export function MealSlot({ mealNumber, dietType, targetMacros }: MealSlotProps) {
    // Temporary state representing selected foods/options to fulfill Task 2
    const [options, setOptions] = useState([{ id: 1, name: 'Opción 1', foods: [] }])

    const addOption = () => {
        if (options.length < 3) {
            setOptions([...options, { id: options.length + 1, name: `Opción ${options.length + 1}`, foods: [] }])
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
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hover)]">
                    <p className="text-sm text-[var(--text-muted)] italic">Añadir alimentos... (Buscador a implementar en P10)</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {options.map((opt) => (
                        <div key={opt.id} className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hover)]">
                            <p className="font-medium text-sm text-[var(--text-primary)] mb-2">{opt.name}</p>
                            <p className="text-sm text-[var(--text-muted)] italic">Añadir alternativas... (Buscador a implementar en P10)</p>
                        </div>
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
