'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, UserRound } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deletePlanAction } from '@/app/(trainer)/routines-templates/actions'

export type RoutineTemplateCardItem = {
  id: string
  name: string
  description: string | null
  days_per_week: number
  is_template: boolean
  client_id: string | null
  client_name: string | null
  total_exercises: number
}

type Props = {
  plan: RoutineTemplateCardItem
}

export function TemplateCard({ plan }: Props) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [serverError, setServerError] = useState<string | null>(null)
  const [pendingDelete, startDelete] = useTransition()

  function handleDelete() {
    setServerError(null)
    startDelete(async () => {
      const result = await deletePlanAction(plan.id)
      if (!result.success) {
        setServerError(result.error ?? 'No se pudo eliminar el plan')
        return
      }

      router.refresh()
      setDeleteOpen(false)
    })
  }

  return (
    <>
      <Card className="card-hover">
        <CardContent className="px-5 py-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-2">{plan.description}</p>
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                plan.is_template
                  ? 'text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20'
                  : 'text-[var(--success)] bg-[var(--success)]/10 border border-[var(--success)]/20'
              }`}
            >
              {plan.is_template ? (
                'Template'
              ) : (
                <>
                  <UserRound className="w-3 h-3" /> Asignado a {plan.client_name ?? 'cliente'}
                </>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] mb-4">
            <span>{plan.days_per_week} días/semana</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>{plan.total_exercises} ejercicios</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/routines-templates/${plan.id}`}>
              <Button variant="secondary" size="sm">
                Editar
              </Button>
            </Link>



            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>



      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDeleteOpen(false)
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-[var(--bg-surface)] rounded-lg w-full max-w-sm shadow-2xl border border-[var(--border)]">
            <div className="px-6 py-5">
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-2">Eliminar plan</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                El plan <span className="font-semibold text-[var(--text-primary)]">{plan.name}</span> se archivará
                (active = false).
              </p>
              {serverError && <p className="text-xs text-[var(--danger)] mt-2">{serverError}</p>}
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteOpen(false)}
                disabled={pendingDelete}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={pendingDelete}
                className="flex-1"
              >
                {pendingDelete ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Eliminando…
                  </>
                ) : (
                  'Eliminar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
