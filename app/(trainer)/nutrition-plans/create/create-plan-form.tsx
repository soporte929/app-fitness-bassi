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

export function CreatePlanForm() {
    const [sex, setSex] = useState<Sex>('male')
    const [age, setAge] = useState<number>(30)
    const [weightKg, setWeightKg] = useState<number>(75)
    const [heightCm, setHeightCm] = useState<number>(175)
    const [fatPercent, setFatPercent] = useState<number | undefined>(undefined)
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
    const [phase, setPhase] = useState<NutritionPhase>('maintenance')

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Form */}
            <div className="lg:col-span-2 space-y-6 bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Parámetros del cliente</h2>

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

            {/* Results Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl sticky top-6">
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

                        <div>
                            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Distribución de Macros</h3>
                            <div className="space-y-3">
                                <div className="bg-[var(--bg-elevated)] p-3 rounded-xl flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Proteína</span>
                                    <div className="text-right">
                                        <span className="block font-bold text-blue-400">{macros.protein.g}g</span>
                                        <span className="block text-xs text-[var(--text-muted)]">{macros.protein.kcal} kcal</span>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-elevated)] p-3 rounded-xl flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Grasa</span>
                                    <div className="text-right">
                                        <span className="block font-bold text-red-400">{macros.fat.g}g</span>
                                        <span className="block text-xs text-[var(--text-muted)]">{macros.fat.kcal} kcal</span>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-elevated)] p-3 rounded-xl flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Carbos</span>
                                    <div className="text-right">
                                        <span className="block font-bold text-green-400">{macros.carbs.g}g</span>
                                        <span className="block text-xs text-[var(--text-muted)]">{macros.carbs.kcal} kcal</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
