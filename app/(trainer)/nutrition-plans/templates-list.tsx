'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { NUTRITION_TEMPLATES } from './templates'
import { assignNutritionTemplateAction } from './actions'

export type ClientOption = {
  id: string
  name: string
}

type TemplatesListProps = {
  clients: ClientOption[]
}

export function TemplatesList({ clients }: TemplatesListProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [statusError, setStatusError] = useState<string>('')

  const handleAssign = (templateIndex: number, client: ClientOption) => {
    setOpenDropdown(null)
    setStatusMessage('')
    setStatusError('')
    startTransition(async () => {
      try {
        const result = await assignNutritionTemplateAction(templateIndex, client.id, client.name)
        if (!result.success) {
          setStatusError(result.error ?? 'No se pudo asignar la plantilla')
          return
        }
        setStatusMessage(result.message ?? `Plan asignado a ${client.name}`)
      } catch (error) {
        console.error(error)
        setStatusError('No se pudo asignar la plantilla')
      }
    })
  }

  if (NUTRITION_TEMPLATES.length === 0) return null

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {NUTRITION_TEMPLATES.map((template, index) => (
          <div
            key={template.name}
            className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 flex flex-col relative"
          >
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#e8e8e6] mb-2">{template.name}</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,127,163,0.15)] text-[#6b7fa3]">
                  {template.kcal_target} kcal
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[#a0a0a0]">
                  {template.protein_target_g}g P
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[#a0a0a0]">
                  {template.carbs_target_g}g C
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[#a0a0a0]">
                  {template.fat_target_g}g G
                </span>
              </div>

              <p className="text-xs text-[#a0a0a0] mb-4">{template.meals.length} comidas configuradas</p>
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div className="relative">
                <button
                  disabled={isPending}
                  onClick={(event) => {
                    event.stopPropagation()
                    setOpenDropdown(openDropdown === index ? null : index)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: 'rgba(107,127,163,0.15)',
                    color: '#6b7fa3',
                    border: '1px solid rgba(107,127,163,0.3)',
                  }}
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Usar plantilla'}
                  {!isPending && <ChevronDown className="w-4 h-4 opacity-70" />}
                </button>

                {openDropdown === index && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                    <div
                      className="absolute right-0 mt-1 w-full z-50 rounded-xl overflow-hidden"
                      style={{
                        background: '#2a2a2a',
                        border: '1px solid rgba(255,255,255,0.08)',
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
                            onClick={() => handleAssign(index, client)}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors truncate"
                            style={{
                              color: '#e8e8e6',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
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
        ))}
      </div>
    </div>
  )
}
