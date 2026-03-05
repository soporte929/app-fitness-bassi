'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clonePlanToClientAction } from '@/app/(trainer)/routines-templates/actions'

type TemplateOption = {
  id: string
  name: string
  description: string | null
  days_per_week: number
  total_exercises: number
}

type Props = {
  clientId: string
  templates: TemplateOption[]
}

export function AssignRoutineButton({ clientId, templates }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => a.name.localeCompare(b.name, 'es-ES')),
    [templates]
  )

  function close() {
    setOpen(false)
    setServerError(null)
  }

  function assignTemplate(templateId: string) {
    setServerError(null)
    setPendingTemplateId(templateId)

    startTransition(async () => {
      const result = await clonePlanToClientAction(templateId, clientId)

      if (!result.success) {
        setServerError(result.error ?? 'No se pudo asignar la rutina')
        setPendingTemplateId(null)
        return
      }

      setPendingTemplateId(null)
      router.refresh()
      close()
    })
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Asignar rutina
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-[var(--bg-surface)] rounded-lg w-full max-w-xl max-h-[85vh] shadow-2xl border border-[var(--border)] flex flex-col">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Asignar rutina</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Selecciona un template para clonar</p>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto space-y-3">
              {serverError && (
                <div className="bg-[var(--danger)]/8 border border-[var(--danger)]/25 rounded-md px-4 py-3">
                  <p className="text-sm text-[var(--danger)]">{serverError}</p>
                </div>
              )}

              {sortedTemplates.length === 0 ? (
                <div className="border border-dashed border-[var(--border)] rounded-lg p-6 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">No hay templates disponibles</p>
                </div>
              ) : (
                sortedTemplates.map((template) => (
                  <div key={template.id} className="rounded-md border border-[var(--border)] bg-[var(--bg-base)] p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{template.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => assignTemplate(template.id)}
                        disabled={pending}
                      >
                        {pending && pendingTemplateId === template.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Asignando…
                          </>
                        ) : (
                          'Asignar'
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {template.days_per_week} días/semana · {template.total_exercises} ejercicios
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={close} className="w-full" disabled={pending}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
