'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveNutritionPlanAction, SaveNutritionPlanPayload } from './nutrition-actions'
import { useRouter } from 'next/navigation'

export function EditNutritionPlanModal({
    clientId,
    plan,
    trigger
}: {
    clientId: string
    plan?: any // rawPlan + meals
    trigger: React.ReactNode
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const [kcal, setKcal] = useState(plan?.kcal_target?.toString() || '')
    const [protein, setProtein] = useState(plan?.protein_target_g?.toString() || '')
    const [carbs, setCarbs] = useState(plan?.carbs_target_g?.toString() || '')
    const [fat, setFat] = useState(plan?.fat_target_g?.toString() || '')

    const [meals, setMeals] = useState<any[]>(
        (plan?.meals || []).map((m: any) => ({
            name: m.name ?? '',
            kcal: m.kcal_per_100g ?? m.kcal ?? '',
            protein_g: m.protein_per_100g ?? m.protein_g ?? '',
            carbs_g: m.carbs_per_100g ?? m.carbs_g ?? '',
            fat_g: m.fat_per_100g ?? m.fat_g ?? '',
            meal_time: m.meal_time ?? '',
        }))
    )

    const addMeal = () => {
        setMeals([...meals, { name: '', kcal: '', protein_g: '', carbs_g: '', fat_g: '', meal_time: '' }])
    }

    const removeMeal = (index: number) => {
        setMeals(meals.filter((_, i) => i !== index))
    }

    const updateMeal = (index: number, field: string, value: string) => {
        const updated = [...meals]
        updated[index] = { ...updated[index], [field]: value }
        setMeals(updated)
    }

    const handleSave = async () => {
        setErrorMsg('')
        setSuccessMsg('')
        if (!kcal || !protein || !carbs || !fat) {
            setErrorMsg('Completa los macros objetivo')
            return
        }

        try {
            setLoading(true)
            const payload: SaveNutritionPlanPayload = {
                clientId,
                planId: plan?.id,
                kcalTarget: parseInt(kcal),
                proteinTarget: parseFloat(protein),
                carbsTarget: parseFloat(carbs),
                fatTarget: parseFloat(fat),
                meals: meals.map(m => ({
                    name: m.name || 'Comida sin nombre',
                    kcal: parseInt(m.kcal) || 0,
                    protein_g: parseFloat(m.protein_g) || 0,
                    carbs_g: parseFloat(m.carbs_g) || 0,
                    fat_g: parseFloat(m.fat_g) || 0,
                    meal_time: m.meal_time || ''
                }))
            }

            await saveNutritionPlanAction(payload)
            setSuccessMsg(plan ? 'Plan actualizado' : 'Plan creado')
            setTimeout(() => {
                setOpen(false)
                router.refresh()
            }, 1000)
        } catch (e: any) {
            setErrorMsg(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>{trigger}</div>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                        <div className="sticky top-0 bg-[var(--bg-surface)] z-10 p-5 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                {plan ? 'Editar plan nutricional' : 'Crear plan nutricional'}
                            </h2>
                            <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-6">
                            {errorMsg && <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 p-3 rounded-md">{errorMsg}</p>}
                            {successMsg && <p className="text-sm text-[var(--success)] bg-[var(--success)]/10 p-3 rounded-md">{successMsg}</p>}

                            <section>
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Objetivos diarios</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[var(--text-secondary)] text-xs font-medium">Kcal objetivo</label>
                                        <input type="number" value={kcal} onChange={(e: any) => setKcal(e.target.value)} placeholder="0" className="flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-sm text-[var(--text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[var(--text-secondary)] text-xs font-medium">Proteína (g)</label>
                                        <input type="number" value={protein} onChange={(e: any) => setProtein(e.target.value)} placeholder="0" className="flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-sm text-[var(--text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[var(--text-secondary)] text-xs font-medium">Carbos (g)</label>
                                        <input type="number" value={carbs} onChange={(e: any) => setCarbs(e.target.value)} placeholder="0" className="flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-sm text-[var(--text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[var(--text-secondary)] text-xs font-medium">Grasa (g)</label>
                                        <input type="number" value={fat} onChange={(e: any) => setFat(e.target.value)} placeholder="0" className="flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-sm text-[var(--text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50" />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Comidas del plan</h3>
                                    <Button type="button" variant="ghost" size="sm" onClick={addMeal} className="border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-8">
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        Añadir comida
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {meals.length === 0 ? (
                                        <p className="text-sm text-[var(--text-muted)] text-center py-6 border border-dashed border-[var(--border)] rounded-lg">
                                            Sin comidas configuradas
                                        </p>
                                    ) : (
                                        meals.map((meal, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row gap-3 bg-[var(--bg-base)] p-3 rounded-xl border border-[var(--border)]">
                                                <div className="space-y-1.5 flex-1 min-w-[120px] flex flex-col">
                                                    <label className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">Nombre</label>
                                                    <input type="text" value={meal.name} onChange={(e: any) => updateMeal(index, 'name', e.target.value)} placeholder="Ej. Desayuno" className="flex h-8 w-full rounded-md border border-transparent bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" />
                                                </div>
                                                <div className="space-y-1.5 w-full sm:w-[70px] shrink-0 flex flex-col">
                                                    <label className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">Hora</label>
                                                    <input type="text" value={meal.meal_time} onChange={(e: any) => updateMeal(index, 'meal_time', e.target.value)} placeholder="08:00" className="flex h-8 w-full rounded-md border border-transparent bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" />
                                                </div>
                                                <div className="space-y-1.5 w-full sm:w-[65px] shrink-0 flex flex-col">
                                                    <label className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">Kcal</label>
                                                    <input type="number" value={meal.kcal} onChange={(e: any) => updateMeal(index, 'kcal', e.target.value)} placeholder="0" className="flex h-8 w-full rounded-md border border-transparent bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" />
                                                </div>
                                                <div className="space-y-1.5 w-full sm:w-[60px] shrink-0 flex flex-col">
                                                    <label className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">Prot</label>
                                                    <input type="number" value={meal.protein_g} onChange={(e: any) => updateMeal(index, 'protein_g', e.target.value)} placeholder="0" className="flex h-8 w-full rounded-md border border-transparent bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" />
                                                </div>
                                                <div className="space-y-1.5 w-full sm:w-[60px] shrink-0 flex flex-col">
                                                    <label className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">Carb</label>
                                                    <input type="number" value={meal.carbs_g} onChange={(e: any) => updateMeal(index, 'carbs_g', e.target.value)} placeholder="0" className="flex h-8 w-full rounded-md border border-transparent bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" />
                                                </div>
                                                <div className="space-y-1.5 w-full sm:w-[60px] shrink-0 flex flex-col">
                                                    <label className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">Gras</label>
                                                    <input type="number" value={meal.fat_g} onChange={(e: any) => updateMeal(index, 'fat_g', e.target.value)} placeholder="0" className="flex h-8 w-full rounded-md border border-transparent bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" />
                                                </div>
                                                <div className="pt-5 shrink-0 flex items-center justify-end sm:justify-center">
                                                    <button onClick={() => removeMeal(index)} className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-md transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <div className="flex justify-end pt-2 border-t border-[var(--border)] pb-2">
                                <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto mt-4 sm:mt-0">
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {plan ? 'Guardar cambios' : 'Crear plan'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
