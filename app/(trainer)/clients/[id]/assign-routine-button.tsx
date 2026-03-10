'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
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
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((value) => !value)}>
        Asignar rutina
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
              <p className="text-xs font-semibold text-[var(--text-primary)]">Asignar rutina</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Selecciona un template para clonar</p>
            </div>

            {serverError && (
              <div className="bg-[var(--danger)]/8 border border-[var(--danger)]/25 rounded-md px-3 py-2">
                <p className="text-xs text-[var(--danger)]">{serverError}</p>
              </div>
            )}

            {sortedTemplates.length === 0 ? (
              <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center">
                <p className="text-xs text-[var(--text-secondary)]">No hay templates disponibles</p>
              </div>
            ) : (
              sortedTemplates.map((template) => (
                <div key={template.id} className="rounded-md border border-[var(--border)] bg-[var(--bg-base)] p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{template.description}</p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => assignTemplate(template.id)} disabled={pending}>
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
        </>
      )}
    </div>
  )
}
