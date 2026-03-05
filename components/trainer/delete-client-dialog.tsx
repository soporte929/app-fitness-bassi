'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { deleteClientAction } from '@/app/(trainer)/clients/actions'

type Props = {
  clientId: string
  clientName: string
  onCancel: () => void
}

const inputCls =
  'w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)] transition-all'

export function DeleteClientDialog({ clientId, clientName, onCancel }: Props) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const canDelete = confirmText === clientName

  function handleDelete() {
    if (!canDelete) return
    setServerError(null)
    startTransition(async () => {
      const result = await deleteClientAction(clientId)
      if (result.success) {
        router.push('/clients')
      } else {
        setServerError(result.error ?? 'Error al eliminar el cliente')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[var(--bg-surface)] rounded-lg w-full max-w-sm shadow-2xl border border-[var(--border)]">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--danger)]/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Eliminar cliente</h2>
              <p className="text-xs text-[var(--text-secondary)]">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Para confirmar, escribe el nombre del cliente:{' '}
            <span className="font-semibold text-[var(--text-primary)]">{clientName}</span>
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={clientName}
            className={inputCls}
            autoFocus
          />

          {serverError && (
            <p className="text-xs text-[var(--danger)] mt-2">{serverError}</p>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={!canDelete || pending}
            className="flex-1"
          >
            {pending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Eliminando…</>
            ) : (
              'Eliminar cliente'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
