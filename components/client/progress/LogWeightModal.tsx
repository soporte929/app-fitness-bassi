"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { logClientMeasurementAction } from "@/app/(client)/progress/actions"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function LogWeightModal({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [weight, setWeight] = useState("")
    const [fat, setFat] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!weight) return

        setLoading(true)
        const payload = {
            weight_kg: parseFloat(weight),
            ...(fat ? { body_fat_pct: parseFloat(fat) } : {}),
        }

        const { success, error } = await logClientMeasurementAction(clientId, payload)

        setLoading(false)
        if (success) {
            setOpen(false)
            setWeight("")
            setFat("")
            router.refresh()
        } else {
            alert("Error: " + error)
        }
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="h-9 px-4 text-xs font-semibold rounded-full bg-[var(--accent)] text-white shadow-sm hover:scale-105 active:scale-95 transition-transform">
                Registrar peso
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[var(--bg-base)] rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Nuevo peso</h2>
                            <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Peso (kg) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    placeholder="Ej: 75.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    % Grasa corporal (opcional)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={fat}
                                    onChange={(e) => setFat(e.target.value)}
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    placeholder="Ej: 15.2"
                                />
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full py-2.5 rounded-lg font-semibold" disabled={loading || !weight}>
                                    {loading ? "Guardando..." : "Guardar registro"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
