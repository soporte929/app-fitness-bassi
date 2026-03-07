'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { addRoutineToPlan, removeRoutineFromPlan } from '../actions'

type AssignedRoutine = {
  workout_plan_id: string
  name: string
  days_per_week: number
  order_index: number
}

type AvailableTemplate = {
  id: string
  name: string
  days_per_week: number
}

export function PlanRoutinesManager({
  planId,
  assignedRoutines,
  availableTemplates,
}: {
  planId: string
  assignedRoutines: AssignedRoutine[]
  availableTemplates: AvailableTemplate[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleAdd = async (workoutPlanId: string) => {
    setLoading(workoutPlanId)
    await addRoutineToPlan(planId, workoutPlanId)
    setLoading(null)
    setOpen(false)
    router.refresh()
  }

  const handleRemove = async (workoutPlanId: string) => {
    setLoading(workoutPlanId)
    await removeRoutineFromPlan(planId, workoutPlanId)
    setLoading(null)
    router.refresh()
  }

  return (
    <div>
      {/* Assigned list */}
      {assignedRoutines.length === 0 ? (
        <p className="text-sm text-[#a0a0a0] py-3">Sin rutinas asignadas</p>
      ) : (
        <div className="space-y-2 mb-4">
          {assignedRoutines.map((r) => (
            <div
              key={r.workout_plan_id}
              className="flex items-center justify-between py-3 px-4 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.05)]"
            >
              <div>
                <p className="text-sm font-medium text-[#e8e8e6]">{r.name}</p>
                <p className="text-xs text-[#a0a0a0] mt-0.5">{r.days_per_week} días/semana</p>
              </div>
              <button
                onClick={() => handleRemove(r.workout_plan_id)}
                disabled={loading === r.workout_plan_id}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[#a0a0a0] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)] transition-colors disabled:opacity-40"
                aria-label="Quitar rutina"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown trigger — positioned relative so the list opens below */}
      <div className="relative inline-block">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(107,127,163,0.15)',
            color: '#6b7fa3',
            border: '1px solid rgba(107,127,163,0.3)',
          }}
        >
          <Plus size={14} />
          Añadir rutina
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="absolute left-0 top-full mt-2 z-50 rounded-xl overflow-hidden w-72"
              style={{
                background: '#2a2a2a',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
              }}
            >
              {availableTemplates.length === 0 ? (
                <p className="px-4 py-3 text-sm" style={{ color: '#a0a0a0' }}>
                  No hay rutinas disponibles
                </p>
              ) : (
                availableTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAdd(t.id)}
                    disabled={loading === t.id}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors"
                    style={{
                      color: '#e8e8e6',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(107,127,163,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#a0a0a0' }}>
                        {t.days_per_week} días/semana
                      </p>
                    </div>
                    <Plus size={14} color="#6b7fa3" />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
