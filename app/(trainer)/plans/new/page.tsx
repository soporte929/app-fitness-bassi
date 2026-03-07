'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { ArrowLeft } from 'lucide-react'
import { createPlan } from '../actions'
import type { PlanPhase, PlanLevel } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

const phases: { value: PlanPhase; label: string }[] = [
  { value: 'recomposition', label: 'Recomposición' },
  { value: 'deficit', label: 'Déficit' },
  { value: 'volume', label: 'Volumen' },
  { value: 'maintenance', label: 'Mantenimiento' },
]

const levels: { value: PlanLevel; label: string; hint: string }[] = [
  { value: 'beginner', label: 'Principiante', hint: '8-12 series por músculo' },
  { value: 'intermediate', label: 'Intermedio', hint: '10-16 series por músculo' },
  { value: 'advanced', label: 'Avanzado', hint: '14-20 series por músculo' },
]

const inputClass =
  'w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e8e8e6] text-sm placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#6b7fa3] focus:shadow-[0_0_0_3px_rgba(107,127,163,0.15)] transition-all'

export default function NewPlanPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phase, setPhase] = useState<PlanPhase | null>(null)
  const [level, setLevel] = useState<PlanLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { id } = await createPlan({
        name: name.trim(),
        description: description.trim() || null,
        phase,
        level,
      })
      router.push(`/plans/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el plan')
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/plans"
            className="w-9 h-9 rounded-xl bg-[#2a2a2a] border border-[rgba(255,255,255,0.07)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#a0a0a0]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#e8e8e6] tracking-tight">Nuevo plan</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] uppercase tracking-wider mb-2">
              Nombre <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Plan fuerza 3 días"
              className={inputClass}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] uppercase tracking-wider mb-2">
              Descripción <span className="text-[#a0a0a0] normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe los objetivos y estructura del plan…"
              rows={3}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          {/* Phase */}
          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] uppercase tracking-wider mb-3">
              Fase
            </label>
            <div className="grid grid-cols-2 gap-2">
              {phases.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPhase(phase === p.value ? null : p.value)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all text-left',
                    phase === p.value
                      ? 'bg-[rgba(107,127,163,0.2)] border-[#6b7fa3] text-[#6b7fa3]'
                      : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#a0a0a0] hover:border-[rgba(255,255,255,0.15)] hover:text-[#e8e8e6]'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] uppercase tracking-wider mb-3">
              Nivel
            </label>
            <div className="space-y-2">
              {levels.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(level === l.value ? null : l.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-left',
                    level === l.value
                      ? 'bg-[rgba(107,127,163,0.2)] border-[#6b7fa3]'
                      : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-medium',
                      level === l.value ? 'text-[#6b7fa3]' : 'text-[#e8e8e6]'
                    )}
                  >
                    {l.label}
                  </span>
                  <span className="text-xs text-[#a0a0a0]">{l.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#ff6b6b] bg-[rgba(255,107,107,0.08)] border border-[rgba(255,107,107,0.2)] rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/plans"
              className="flex-1 text-center py-3 rounded-xl bg-[rgba(255,255,255,0.05)] text-[#a0a0a0] text-sm font-medium hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-[#6b7fa3] text-white text-sm font-medium hover:bg-[#7d90b5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando…' : 'Crear plan'}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  )
}
