'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { assignOwnNutritionTemplateAction } from './actions'
import type { ClientOption } from './templates-list'

export type TrainerTemplateItem = {
  id: string
  name: string
  kcalTarget: number | null
  proteinTarget: number | null
  carbsTarget: number | null
  fatTarget: number | null
  mealsCount: number
}

type Props = {
  clients: ClientOption[]
  templates: TrainerTemplateItem[]
}

export function TrainerTemplatesList({ clients, templates }: Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [statusError, setStatusError] = useState<string>('')

  const handleAssign = (
    e: React.MouseEvent<HTMLButtonElement>,
    templateId: string,
    client: ClientOption
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenDropdown(null)
    setPendingTemplateId(templateId)
    setStatusMessage('')
    setStatusError('')

    startTransition(async () => {
      try {
        const result = await assignOwnNutritionTemplateAction(templateId, client.id, client.name)
        if (!result.success) {
          setStatusError(result.error ?? 'No se pudo asignar la plantilla')
          return
        }
        setStatusMessage(result.message ?? `Plan asignado a ${client.name}`)
      } catch (error) {
        console.error(error)
        setStatusError('No se pudo asignar la plantilla')
      } finally {
        setPendingTemplateId(null)
      }
    })
  }

  if (templates.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
        <p className="text-sm text-[var(--text-muted)]">Todavía no has creado plantillas propias</p>
      </div>
    )
  }

  return (
    <div>
      {statusMessage && (
        <p className="mb-3 rounded-xl border border-[rgba(48,209,88,0.25)] bg-[rgba(48,209,88,0.10)] px-3 py-2 text-sm text-[#30d158]">
          {statusMessage}
        </p>
      )}
      {statusError && (
        <p className="mb-3 rounded-xl border border-[rgba(255,69,58,0.22)] bg-[rgba(255,69,58,0.10)] px-3 py-2 text-sm text-[#ff9f9a]">
          {statusError}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isCurrentPending = isPending && pendingTemplateId === template.id
          return (
            <div
              key={template.id}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col relative"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{template.name}</h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,127,163,0.15)] text-[#6b7fa3]">
                    {template.kcalTarget ?? 0} kcal
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                    {template.proteinTarget ?? 0}g P
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                    {template.carbsTarget ?? 0}g C
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                    {template.fatTarget ?? 0}g G
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-4">{template.mealsCount} comidas configuradas</p>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <div className="relative">
                  <button
                    disabled={isPending}
                    onClick={() => setOpenDropdown(openDropdown === template.id ? null : template.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      background: 'rgba(107,127,163,0.15)',
                      color: '#6b7fa3',
                      border: '1px solid rgba(107,127,163,0.3)',
                    }}
                  >
                    {isCurrentPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        Asignar a cliente
                        <ChevronDown className="w-4 h-4 opacity-70" />
                      </>
                    )}
                  </button>

                  {openDropdown === template.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                      <div
                        className="absolute right-0 mt-1 w-full z-50 rounded-xl overflow-hidden"
                        style={{
                          background: '#2a2a2a',
                          border: '1px solid var(--border)',
                          boxShadow: '0 16px 32px rgba(0,0,0,0.6)',
                          maxHeight: '240px',
                          overflowY: 'auto',
                        }}
                      >
                        {clients.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-center" style={{ color: '#a0a0a0' }}>
                            No hay clientes activos
                          </p>
                        ) : (
                          clients.map((client) => (
                            <button
                              key={client.id}
                              onClick={(e) => handleAssign(e, template.id, client)}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--bg-elevated)] transition-colors truncate"
                              style={{
                                color: '#e8e8e6',
                                borderBottom: '1px solid var(--border)',
                              }}
                            >
                              {client.name}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
