'use client'

import React, { useEffect, useState } from 'react'

interface MacroTargets {
    kcal: number
    protein: number
    carbs: number
    fat: number
}

interface MacroProgressBarsProps {
    targets?: MacroTargets | null
    consumed: {
        kcal: number
        protein: number
        carbs: number
        fat: number
    }
}

function formatValue(value: number, maxDecimals = 1): string {
    const shouldShowDecimals = Math.abs(value % 1) > 0
    return value.toLocaleString('es-ES', {
        minimumFractionDigits: shouldShowDecimals ? 1 : 0,
        maximumFractionDigits: shouldShowDecimals ? maxDecimals : 0,
    })
}

function clampProgress(consumed: number, target: number): number {
    if (target <= 0) return 0
    return Math.min((consumed / target) * 100, 100)
}

export function MacroProgressBars({ targets, consumed }: MacroProgressBarsProps) {
    const hasPlan = !!targets
    // Delay the animation slightly so it visually fills up on mount
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Use 1 as a fallback target to prevent division by zero if no plan is assigned, but still display "--" for target.
    const cards = [
        { label: 'Kcal', consumed: consumed.kcal, target: targets?.kcal ?? 1, displayTarget: targets?.kcal, unit: 'kcal', color: '#ffb703' },
        { label: 'Proteína', consumed: consumed.protein, target: targets?.protein ?? 1, displayTarget: targets?.protein, unit: 'g', color: '#fb8500' },
        { label: 'Carbos', consumed: consumed.carbs, target: targets?.carbs ?? 1, displayTarget: targets?.carbs, unit: 'g', color: '#8ecae6' },
        { label: 'Grasa', consumed: consumed.fat, target: targets?.fat ?? 1, displayTarget: targets?.fat, unit: 'g', color: '#219ebc' },
    ]

    return (
        <section className="mb-6">
            <div className="grid grid-cols-2 gap-3">
                {cards.map((card, index) => {
                    const progressPercent = hasPlan ? clampProgress(card.consumed, card.target) : 0

                    return (
                        <div
                            key={card.label}
                            className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 shadow-sm"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                                transition: `all 0.4s ease-out ${index * 0.05}s`
                            }}
                        >
                            <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">{card.label}</p>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <p className="text-2xl font-bold font-[family-name:var(--font-geist-mono)] text-[#e8e8e6]">
                                    {formatValue(card.consumed)}
                                </p>
                                <p className="text-xs text-[#a0a0a0] font-medium pb-0.5">
                                    / {hasPlan && card.displayTarget !== undefined ? formatValue(card.displayTarget, 0) : '--'} {card.unit}
                                </p>
                            </div>
                            <div className="mt-3 h-[4px] bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden relative">
                                <div
                                    className="absolute left-0 top-0 bottom-0 rounded-full"
                                    style={{
                                        backgroundColor: card.color,
                                        width: mounted ? `${progressPercent}%` : '0%',
                                        transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s'
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
            {!hasPlan && (
                <p
                    className="text-xs text-[#a0a0a0] mt-4 text-center p-3 bg-[rgba(255,255,255,0.03)] rounded-lg border border-[rgba(255,255,255,0.05)]"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transition: 'opacity 0.4s ease-out 0.3s'
                    }}
                >
                    No tienes un plan activo. Tu entrenador te puede asignar uno.
                </p>
            )}
        </section>
    )
}
