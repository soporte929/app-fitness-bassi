'use client'

import React, { useState } from 'react'
import {
    ActivityLevel,
    calculateMacros,
    calculateTargetCalories,
    calculateTDEE,
    calculateTMB,
    NutritionPhase,
    Sex,
    ACTIVITY_LABELS
} from '@/lib/calculations/nutrition'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { MealSlot } from './meal-slot'

export type DietType = 'A' | 'B' | 'C'

export function CreatePlanForm() {
    const [sex, setSex] = useState<Sex>('male')
    const [age, setAge] = useState<number>(30)
    const [weightKg, setWeightKg] = useState<number>(75)
    const [heightCm, setHeightCm] = useState<number>(175)
    const [fatPercent, setFatPercent] = useState<number | undefined>(undefined)
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
    const [phase, setPhase] = useState<NutritionPhase>('maintenance')

    // Diet structure state
    const [planName, setPlanName] = useState<string>('')
    const [dietType, setDietType] = useState<DietType>('C')
    const [mealsCount, setMealsCount] = useState<number>(4)

    // Live calculations
    const tmb = calculateTMB({
        weightKg,
        fatPercent: fatPercent || undefined,
        heightCm,
        age,
        sex,
    })

    const tdee = calculateTDEE(tmb, activityLevel)
    const targetCalories = calculateTargetCalories(tdee, phase)
    const macros = calculateMacros(weightKg, phase, targetCalories)

    // Calculate generic per-meal targets
    const mealMacros = {
        protein: Math.round(macros.protein.g / mealsCount),
        carbs: Math.round(macros.carbs.g / mealsCount),
        fat: Math.round(macros.fat.g / mealsCount),
        kcal: Math.round(targetCalories / mealsCount),
    }

    const handleSaveDraft = () => {
        // Generate Draft payload matching Supabase structure
        const payload = {
            nutrition_plans: {
                name: planName || 'Plan Sin Título',
                kcal_target: targetCalories,
                protein_target_g: macros.protein.g,
                carbs_target_g: macros.carbs.g,
                fat_target_g: macros.fat.g,
            },
            meal_plan_items: dietType === 'C' ? [] : Array.from({ length: mealsCount }).map((_, i) => ({
                meal_number: i + 1,
                food_id: null,
                dish_id: null,
                option_slot: dietType === 'B' ? 'A' : null,
                grams: 0
            }))
        }
        console.log("=== PLAN DRAFT ===")
        console.log(JSON.stringify(payload, null, 2))
        alert("Plan generado en consola (Draft mode).")
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Forms column */}
            <div className="xl:col-span-2 space-y-8">

                {/* Configuration Form */}
                <div className="space-y-6 bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        1. Parámetros del Cliente
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Sexo</label>
                            <Select value={sex} onValueChange={(val) => setSex(val as Sex)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Hombre</SelectItem>
                                    <SelectItem value="female">Mujer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Edad</label>
                            <input type="number" className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" value={age || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Peso (kg)</label>
                            <input type="number" className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" value={weightKg || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightKg(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Altura (cm)</label>
                            <input type="number" className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" value={heightCm || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeightCm(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">% Grasa (Opcional)</label>
                            <input
                                type="number"
                                placeholder="Ej. 15"
                                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                value={fatPercent ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFatPercent(e.target.value ? Number(e.target.value) : undefined)}
                            />
                            <p className="text-xs text-[var(--text-muted)]">
                                {fatPercent ? 'Usa Katch-McArdle' : 'Usa Mifflin-St Jeor'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Nivel de Actividad</label>
                            <Select value={activityLevel} onValueChange={(val) => setActivityLevel(val as ActivityLevel)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                                        <SelectItem key={val} value={val}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Objetivo (Fase)</label>
                            <Select value={phase} onValueChange={(val) => setPhase(val as NutritionPhase)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deficit">Déficit (Pérdida de grasa)</SelectItem>
                                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                    <SelectItem value="recomposition">Recomposición corporal</SelectItem>
                                    <SelectItem value="volume">Volumen (Ganancia muscular)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Plan Structure settings */}
                <div className="space-y-6 bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">2. Estructura de Dieta</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Nombre del Plan</label>
                            <input
                                type="text"
                                placeholder="Ej. Plan Verano 2026"
                                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                value={planName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Tipo de Dieta</label>
                                <Select value={dietType} onValueChange={(val) => setDietType(val as DietType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A - Estructurada</SelectItem>
                                        <SelectItem value="B">B - Alternativas (Opciones)</SelectItem>
                                        <SelectItem value="C">C - Flexible (Solo Macros)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {dietType !== 'C' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-[var(--text-primary)]">Comidas al día</label>
                                    <Select value={mealsCount.toString()} onValueChange={(val) => setMealsCount(Number(val))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 Comidas</SelectItem>
                                            <SelectItem value="4">4 Comidas</SelectItem>
                                            <SelectItem value="5">5 Comidas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meals UI */}
                {dietType !== 'C' && (
                    <div className="space-y-6 bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">3. Generador de Comidas</h2>
                        <div className="space-y-6">
                            {Array.from({ length: mealsCount }).map((_, i) => (
                                <MealSlot
                                    key={i}
                                    mealNumber={i + 1}
                                    dietType={dietType}
                                    targetMacros={mealMacros}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Results Sidebar */}
            <div className="xl:col-span-1 space-y-6">
                <Card className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl sticky top-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Resultados</h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                            <span className="text-[var(--text-secondary)] text-sm">TMB</span>
                            <span className="font-semibold text-[var(--text-primary)]">{tmb} kcal</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                            <span className="text-[var(--text-secondary)] text-sm">TDEE</span>
                            <span className="font-semibold text-[var(--text-primary)]">{tdee} kcal</span>
                        </div>

                        <div className="flex justify-between items-center pb-6 border-b border-[var(--border)]">
                            <span className="text-[var(--text-primary)] font-medium">Objetivo Diario</span>
                            <span className="text-2xl font-bold text-[#F5C518]">{targetCalories} kcal</span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Distribución de Macros</h3>
                            <div className="space-y-3">
                                <div className="bg-[var(--bg-elevated)] p-3 rounded-xl flex justify-between items-center shadow-sm">
                                    <span className="text-sm font-medium text-white">Proteína</span>
                                    <div className="text-right">
                                        <span className="block font-bold text-blue-400">{macros.protein.g}g</span>
                                        <span className="block text-xs text-[var(--text-muted)]">{macros.protein.kcal} kcal</span>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-elevated)] p-3 rounded-xl flex justify-between items-center shadow-sm">
                                    <span className="text-sm font-medium text-white">Grasa</span>
                                    <div className="text-right">
                                        <span className="block font-bold text-red-400">{macros.fat.g}g</span>
                                        <span className="block text-xs text-[var(--text-muted)]">{macros.fat.kcal} kcal</span>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-elevated)] p-3 rounded-xl flex justify-between items-center shadow-sm">
                                    <span className="text-sm font-medium text-white">Carbos</span>
                                    <div className="text-right">
                                        <span className="block font-bold text-green-400">{macros.carbs.g}g</span>
                                        <span className="block text-xs text-[var(--text-muted)]">{macros.carbs.kcal} kcal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--border)]">
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="w-full bg-[var(--accent)] hover:brightness-110 text-black font-bold py-3 px-4 rounded-xl transition-all"
                            >
                                Guardar como plantilla
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
