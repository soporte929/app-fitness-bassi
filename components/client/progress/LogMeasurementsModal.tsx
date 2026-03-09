"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { logClientMeasurementAction } from "@/app/(client)/progress/actions"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function LogMeasurementsModal({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [waist, setWaist] = useState("")
    const [hip, setHip] = useState("")
    const [chest, setChest] = useState("")
    const [arm, setArm] = useState("")
    const [thigh, setThigh] = useState("")

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Check if at least one is filled
        if (!waist && !hip && !chest && !arm && !thigh) {
            alert("Debes llenar al menos un campo")
            return
        }

        setLoading(true)
        const payload = {
            ...(waist ? { waist_cm: parseFloat(waist) } : {}),
            ...(hip ? { hip_cm: parseFloat(hip) } : {}),
            ...(chest ? { chest_cm: parseFloat(chest) } : {}),
            ...(arm ? { arm_cm: parseFloat(arm) } : {}),
            ...(thigh ? { thigh_cm: parseFloat(thigh) } : {}),
        }

        const { success, error } = await logClientMeasurementAction(clientId, payload)

        setLoading(false)
        if (success) {
            setOpen(false)
            setWaist("")
            setHip("")
            setChest("")
            setArm("")
            setThigh("")
            router.refresh()
        } else {
            alert("Error: " + error)
        }
    }

    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)} className="h-9 px-4 text-xs font-semibold rounded-full border border-[var(--border)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-elevated)] hover:scale-105 active:scale-95 transition-all">
                Medidas
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[var(--bg-base)] rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Registrar medidas</h2>
                            <button type="button" onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                        Cintura (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={waist}
                                        onChange={(e) => setWaist(e.target.value)}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                        Cadera (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={hip}
                                        onChange={(e) => setHip(e.target.value)}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                        Pecho (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={chest}
                                        onChange={(e) => setChest(e.target.value)}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                        Brazo (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={arm}
                                        onChange={(e) => setArm(e.target.value)}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                    Muslo (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={thigh}
                                    onChange={(e) => setThigh(e.target.value)}
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                />
                            </div>

                            <div className="pt-3 pb-2">
                                <Button type="submit" className="w-full py-2.5 rounded-lg font-semibold" disabled={loading || (!waist && !hip && !chest && !arm && !thigh)}>
                                    {loading ? "Guardando..." : "Guardar medidas"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
