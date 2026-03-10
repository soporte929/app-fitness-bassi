'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, UtensilsCrossed, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { assignNutritionTemplateToClientAction, NutritionTemplate } from './nutrition-actions'

interface AssignNutritionPlanModalProps {
    clientId: string
    clientName: string
    templates: NutritionTemplate[]
}

export function AssignNutritionPlanModal({
    clientId,
    clientName,
    templates,
}: AssignNutritionPlanModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const handleAssign = () => {
        if (!selectedTemplateId) return
        setError(null)
        startTransition(async () => {
            const result = await assignNutritionTemplateToClientAction(
                selectedTemplateId,
                clientId,
                clientName,
                startDate
            )
            if (!result.success) {
                setError(result.error ?? 'Error al asignar')
                return
            }
            router.refresh()
            setOpen(false)
        })
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition-colors hover:bg-[var(--bg-overlay)] bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
                <UtensilsCrossed className="w-4 h-4" />
                Asignar plan nutricional
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 bg-[var(--bg-surface)] z-10 p-5 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Asignar plan nutricional
                            </h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-5">
                            {templates.length === 0 ? (
                                <div className="text-center py-10 space-y-3">
                                    <UtensilsCrossed className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        No tienes plantillas de nutrición. Crea una plantilla primero.
                                    </p>
                                    <Link
                                        href="/nutrition-plans"
                                        className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline font-medium"
                                    >
                                        Ir a plantillas
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Template list */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                            Selecciona una plantilla
                                        </p>
                                        {templates.map((template) => (
                                            <div
                                                key={template.id}
                                                onClick={() => setSelectedTemplateId(template.id)}
                                                className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                                                    selectedTemplateId === template.id
                                                        ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                                        : 'border-[var(--border)] bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)]'
                                                }`}
                                            >
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                    {template.name ?? 'Sin nombre'}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                    {template.kcal_target} kcal · P:{template.protein_target_g}g · C:{template.carbs_target_g}g · G:{template.fat_target_g}g
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Start date */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                            Fecha de inicio
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-sm text-[var(--text-primary)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 p-3 rounded-md">
                                            {error}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {templates.length > 0 && (
                            <div className="p-5 pt-0 border-t border-[var(--border)]">
                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedTemplateId || pending}
                                    className="w-full"
                                >
                                    {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Asignar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
