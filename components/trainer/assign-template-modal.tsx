'use client'

import { useMemo, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clonePlanToClientAction } from '@/app/(trainer)/routines-templates/actions'
import type { RoutineClientOption } from '@/app/(trainer)/routines-templates/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  planName: string
  clients: RoutineClientOption[]
  defaultClientId?: string
  onAssigned?: (newPlanId: string) => void
}

const inputCls =
  'w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all'

export function AssignTemplateModal({
  open,
  onOpenChange,
  planId,
  planName,
  clients,
  defaultClientId,
  onAssigned,
}: Props) {
  const router = useRouter()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.name.localeCompare(b.name, 'es-ES')),
    [clients]
  )

  if (!open || typeof document === 'undefined') return null

  const resolvedClientId = selectedClientId ?? defaultClientId ?? sortedClients[0]?.id ?? ''

  function close() {
    onOpenChange(false)
    setServerError(null)
    setSelectedClientId(null)
  }

  function handleAssign() {
    if (!resolvedClientId) {
      setServerError('Selecciona un cliente')
      return
    }

    setServerError(null)
    startTransition(async () => {
      const result = await clonePlanToClientAction(planId, resolvedClientId)
      if (!result.success) {
        setServerError(result.error ?? 'No se pudo asignar el template')
        return
      }

      router.refresh()
      if (result.newPlanId && onAssigned) {
        onAssigned(result.newPlanId)
      }
      close()
    })
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={close} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative bg-[var(--bg-surface)] rounded-lg w-full max-w-md shadow-2xl pointer-events-auto border border-[var(--border)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Asignar template</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{planName}</p>
            </div>
            <button
              onClick={close}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-3">
            {serverError && (
              <div className="bg-[var(--danger)]/8 border border-[var(--danger)]/25 rounded-md px-4 py-3">
                <p className="text-sm text-[var(--danger)]">{serverError}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Cliente</label>
              <select
                value={resolvedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className={inputCls}
                disabled={pending || sortedClients.length === 0}
              >
                {sortedClients.length === 0 && <option value="">Sin clientes activos</option>}
                {sortedClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
            <Button variant="ghost" size="sm" onClick={close} disabled={pending} className="flex-1">
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={pending || sortedClients.length === 0 || !resolvedClientId}
              className="flex-1"
            >
              {pending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Asignando…
                </>
              ) : (
                'Asignar rutina'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
