'use client'

import { useMemo, useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PickedExercise = {
  name: string
  muscleGroup: string
}

const LIBRARY: Record<string, string[]> = {
  Pecho: [
    'Press Banca Barra',
    'Press Inclinado Mancuerna',
    'Press Declinado Barra',
    'Aperturas Polea',
    'Fondos Pecho',
    'Press Pecho Máquina',
  ],
  Espalda: [
    'Dominadas',
    'Dominadas Supinadas',
    'Remo Barra',
    'Remo Mancuerna',
    'Jalón Polea',
    'Remo en Polea Baja',
    'Face Pull',
    'Pull-Over Polea',
  ],
  Hombros: [
    'Press Militar Barra',
    'Press Arnold',
    'Elevaciones Laterales',
    'Pájaro (Rear Delt)',
    'Press Hombro Máquina',
    'Elevaciones Frontales',
  ],
  Bíceps: [
    'Curl Barra',
    'Curl Mancuerna',
    'Curl Martillo',
    'Curl Concentración',
    'Curl Polea Baja',
    'Curl Inclinado',
  ],
  Tríceps: [
    'Press Francés',
    'Extensión Polea Alta',
    'Fondos Tríceps',
    'Patada Tríceps Mancuerna',
    'Press Cerrado',
    'Extensión Mancuerna Sobre Cabeza',
  ],
  Cuádriceps: [
    'Sentadilla Libre',
    'Prensa Piernas',
    'Extensión Cuádriceps Máquina',
    'Zancadas',
    'Sentadilla Hack',
    'Sentadilla Búlgara',
  ],
  Isquios: [
    'Curl Femoral Tumbado',
    'Curl Femoral Sentado',
    'Peso Muerto Rumano',
    'Peso Muerto Piernas Rígidas',
    'Nordic Curl',
  ],
  Glúteos: [
    'Hip Thrust Barra',
    'Hip Thrust Máquina',
    'Abducción Cadera Máquina',
    'Patada Glúteo Polea',
    'Zancadas Búlgaras',
  ],
  Gemelos: [
    'Elevación Talones de Pie',
    'Elevación Talones Sentado',
    'Elevación Talones Prensa',
  ],
  Core: [
    'Plancha',
    'Crunch Polea',
    'Rueda Abdominal',
    'Elevación de Piernas Colgado',
    'Oblicuos Polea',
    'Crunch Bicicleta',
    'Dragon Flag',
  ],
}

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (exercise: PickedExercise) => void
}

export function ExercisePicker({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const muscles = Object.keys(LIBRARY)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return muscles.flatMap((group) => {
      if (filter && group !== filter) return []
      const names = (LIBRARY[group] ?? []).filter(
        (name) => !q || name.toLowerCase().includes(q)
      )
      return names.length > 0 ? [{ group, names }] : []
    })
  }, [query, filter])

  function handleSelect(name: string, group: string) {
    onSelect({ name, muscleGroup: group })
    setQuery('')
    setFilter(null)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[80vh] rounded-xl flex flex-col min-h-0 bg-[var(--bg-surface)] border border-[var(--border)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Añadir ejercicio</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Muscle filter chips */}
        <div className="flex-shrink-0 px-4 py-2 flex gap-1.5 overflow-x-auto border-b border-[var(--border)] scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 border transition-colors',
              filter === null
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
            )}
          >
            Todos
          </button>
          {muscles.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setFilter(filter === group ? null : group)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 border transition-colors',
                filter === group
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
              )}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Sin resultados{query ? ` para "${query}"` : ''}
              </p>
            </div>
          ) : (
            filtered.map(({ group, names }) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-elevated)] sticky top-0">
                  {group}
                </p>
                {names.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelect(name, group)}
                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border-b border-[var(--border)] last:border-0 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
