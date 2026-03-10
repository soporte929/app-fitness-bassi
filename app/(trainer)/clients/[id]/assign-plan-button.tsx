'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assignPlanToClientAction } from '@/app/(trainer)/clients/actions'

type PlanOption = {
  id: string
  name: string
  description: string | null
  phase: string | null
  level: string | null
}

type Props = {
  clientId: string
  plans: PlanOption[]
}

export function AssignPlanButton({ clientId, plans }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.name.localeCompare(b.name, 'es-ES')),
    [plans]
  )

  function close() {
    setOpen(false)
    setServerError(null)
  }

  function assignPlan(planId: string) {
    setServerError(null)
    setPendingPlanId(planId)

    startTransition(async () => {
      const result = await assignPlanToClientAction(planId, clientId)

      if (!result.success) {
        setServerError(result.error ?? 'No se pudo asignar el plan')
        setPendingPlanId(null)
        return
      }

      setPendingPlanId(null)
      router.refresh()
      close()
    })
  }

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((value) => !value)}>
        Asignar plan
      </Button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar selector"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={close}
          />
          <div className="absolute top-full right-0 mt-2 z-50 min-w-[280px] max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto bg-[#2a2a2a] rounded-xl shadow-xl border border-[rgba(255,255,255,0.08)] p-3 space-y-2">
            <div className="px-1 pb-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Asignar plan</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Selecciona un plan para asignar al cliente</p>
            </div>

            {serverError && (
              <div className="bg-[var(--danger)]/8 border border-[var(--danger)]/25 rounded-md px-3 py-2">
                <p className="text-xs text-[var(--danger)]">{serverError}</p>
              </div>
            )}

            {sortedPlans.length === 0 ? (
              <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center">
                <p className="text-xs text-[var(--text-secondary)]">
                  No hay planes disponibles. Crea un plan en /plans primero.
                </p>
              </div>
            ) : (
              sortedPlans.map((plan) => (
                <div key={plan.id} className="rounded-md border border-[var(--border)] bg-[var(--bg-base)] p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{plan.name}</p>
                      {plan.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{plan.description}</p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => assignPlan(plan.id)} disabled={pending}>
                      {pending && pendingPlanId === plan.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Asignando…
                        </>
                      ) : (
                        'Asignar'
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.phase && (
                      <span className="text-[10px] font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-full">
                        {plan.phase}
                      </span>
                    )}
                    {plan.level && (
                      <span className="text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-full">
                        {plan.level}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
