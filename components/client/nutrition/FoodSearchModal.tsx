'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { Plus, X, Loader2, Search } from 'lucide-react'
import { searchFoodsAction, logFreeFoodAction } from '@/app/(client)/nutrition/actions'

export function FoodSearchModal({ clientId, dateStr, trigger }: { clientId: string; dateStr: string; trigger?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loadingSearch, setLoadingSearch] = useState(false)

    const [selectedItem, setSelectedItem] = useState<any | null>(null)
    const [grams, setGrams] = useState<string>('100')
    const [isPending, startTransition] = useTransition()

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!query.trim() || selectedItem) {
            setResults([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setLoadingSearch(true)
            const res = await searchFoodsAction(query)
            if (res.success) {
                setResults(res.data || [])
            }
            setLoadingSearch(false)
        }, 400)

        return () => clearTimeout(timeoutId)
    }, [query, selectedItem])

    const closeSheet = () => {
        setIsOpen(false)
        setTimeout(() => {
            setQuery('')
            setSelectedItem(null)
            setError(null)
        }, 300)
    }

    const handleSelect = (item: any) => {
        setSelectedItem(item)
        setGrams('100')
    }

    const parsedGrams = Number(grams)
    const factor = isNaN(parsedGrams) ? 0 : parsedGrams / 100

    const handleSave = () => {
        if (!selectedItem || isNaN(parsedGrams) || parsedGrams <= 0) return

        startTransition(async () => {
            const res = await logFreeFoodAction(
                clientId,
                selectedItem.id,
                selectedItem.type,
                parsedGrams,
                dateStr
            )
            if (res.success) {
                closeSheet()
            } else {
                setError(res.error || 'Error al guardar')
            }
        })
    }

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed z-50 flex items-center justify-center rounded-full shadow-xl transition-transform active:scale-95 hover:brightness-110"
                    style={{ bottom: 80, right: 16, width: 56, height: 56, background: '#fb8500' }}
                >
                    <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>
            )}

            <div
                className={`fixed inset-0 z-[80] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={closeSheet}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <div
                    className={`absolute bottom-0 left-0 right-0 mx-auto max-w-[430px] rounded-t-2xl flex flex-col bg-[#1a1a1a] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ height: '85vh' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0 border-b border-[var(--border)]">
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                            {selectedItem ? 'Detalles del alimento' : 'Buscar alimento'}
                        </h3>
                        <button onClick={closeSheet} className="text-[var(--text-muted)] hover:text-white p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {!selectedItem ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder="Buscar comida (ej. manzana, pollo)..."
                                        className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#fb8500]"
                                        autoFocus
                                    />
                                    {loadingSearch && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#fb8500] animate-spin" />}
                                </div>

                                <div className="space-y-2">
                                    {results.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className="w-full text-left bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border)] active:scale-[0.98] transition-transform"
                                        >
                                            <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                {item.kcal_per_100g} kcal · {item.protein_per_100g}g P · {item.carbs_per_100g}g C · {item.fat_per_100g}g G <span className="opacity-50">(por 100g)</span>
                                            </p>
                                        </button>
                                    ))}
                                    {query && !loadingSearch && results.length === 0 && (
                                        <p className="text-center text-[var(--text-muted)] text-sm mt-4">No se encontraron resultados</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium text-[var(--text-primary)]">{selectedItem.name}</h4>
                                    <p className="text-sm text-[var(--text-muted)] capitalize mt-0.5">{selectedItem.type === 'food' ? 'Alimento base' : 'Plato guardado'}</p>
                                </div>

                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">Cantidad consumida</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={grams}
                                            onChange={e => setGrams(e.target.value)}
                                            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl py-3 px-4 text-lg text-[var(--text-primary)] focus:outline-none focus:border-[#fb8500] w-32"
                                            min="1"
                                            autoFocus
                                        />
                                        <span className="text-[var(--text-muted)] font-medium">gramos (g)</span>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
                                    <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wide">Macros estimados</p>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div>
                                            <p className="text-lg font-semibold text-[var(--text-primary)]">{Math.round(selectedItem.kcal_per_100g * factor)}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Kcal</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-[var(--text-primary)]">{Math.round(selectedItem.protein_per_100g * factor)}g</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Pro</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-[var(--text-primary)]">{Math.round(selectedItem.carbs_per_100g * factor)}g</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Car</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-[var(--text-primary)]">{Math.round(selectedItem.fat_per_100g * factor)}g</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Gra</p>
                                        </div>
                                    </div>
                                </div>

                                {error && <p className="text-xs text-red-400">{error}</p>}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="flex-1 py-3 bg-[var(--bg-elevated)] rounded-xl text-sm font-medium text-[var(--text-primary)] active:scale-[0.98]"
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isPending || isNaN(parsedGrams) || parsedGrams <= 0}
                                        className="flex-[2] py-3 bg-white text-black rounded-xl text-sm font-semibold active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Guardar registro
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
