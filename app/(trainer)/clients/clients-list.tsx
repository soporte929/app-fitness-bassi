'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/ui/badge'
import { Search, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { assignPlanToClientAction } from './actions'
import { AssignPlanDropdown } from '@/components/trainer/assign-plan-dropdown'

export type ClientItem = {
  id: string
  name: string
  phase: string
  goal: string | null
  status: 'green' | 'yellow' | 'red'
  adherence: number
  lastWorkout: string
  weightKg: number
  alert: string | null
  activePlanName: string | null
}

export type TemplateItem = {
  id: string
  name: string
}

type StatusFilter = 'all' | 'green' | 'yellow' | 'red'

const statusLabels: Record<StatusFilter, string> = {
  all: 'Todos',
  green: 'Correcto',
  yellow: 'Revisar',
  red: 'Intervención',
}

const statusDotColor: Record<StatusFilter, string> = {
  all: 'var(--accent)',
  green: 'var(--success)',
  yellow: 'var(--warning)',
  red: 'var(--danger)',
}

export function ClientsListUI({
  clients,
  templates,
}: {
  clients: ClientItem[]
  templates: TemplateItem[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts: Record<StatusFilter, number> = {
    all: clients.length,
    green: clients.filter((c) => c.status === 'green').length,
    yellow: clients.filter((c) => c.status === 'yellow').length,
    red: clients.filter((c) => c.status === 'red').length,
  }

  async function handleAssign(clientId: string, planId: string): Promise<void> {
    await assignPlanToClientAction(planId, clientId)
    router.refresh()
  }

  return (
    <>
      {/* Filtros de estado */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(statusLabels) as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all border',
              statusFilter === s
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
            )}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusFilter === s ? 'var(--bg-base)' : statusDotColor[s] }}
            />
            {statusLabels[s]}
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full ml-0.5',
                statusFilter === s ? 'bg-[var(--bg-base)]/20 text-[var(--bg-base)]' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
              )}
            >
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            ×
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <SlidersHorizontal className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm text-[var(--text-secondary)]">No hay clientes con ese filtro</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Fase</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Último entreno</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Adherencia</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Plan</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((client, i) => (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{client.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{client.name}</p>
                          {client.alert && <p className="text-xs text-[var(--danger)] mt-0.5">{client.alert}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[var(--text-secondary)]">{client.phase}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        status={client.status}
                        label={
                          client.status === 'green'
                            ? 'Correcto'
                            : client.status === 'yellow'
                              ? 'Revisar'
                              : 'Intervención'
                        }
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                      {client.lastWorkout}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <p
                          className={cn(
                            'text-sm font-semibold w-9 text-right',
                            client.adherence >= 80 ? 'text-[var(--success)]' : client.adherence >= 60 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
                          )}
                        >
                          {client.adherence}%
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {client.activePlanName ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-emerald-400">
                            {client.activePlanName}
                          </span>
                        </div>
                      ) : (
                        <AssignPlanDropdown
                          clientId={client.id}
                          plans={templates}
                          onAssign={handleAssign}
                        />
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] inline-block flex-shrink-0" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden space-y-3">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="rounded-xl p-4"
                style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm" style={{ color: '#e8e8e6' }}>
                    {client.name}
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(107,127,163,0.15)', color: '#6b7fa3' }}
                  >
                    {client.phase}
                  </span>
                </div>
                <p className="text-xs mb-3" style={{ color: '#a0a0a0' }}>
                  {client.goal ?? 'Objetivo no especificado'}
                </p>
                <div className="flex gap-2 flex-wrap items-center">
                  <button
                    className="flex-1 py-2 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#e8e8e6' }}
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    Ver perfil
                  </button>
                  <div className="flex-1 flex justify-end">
                    {client.activePlanName ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-emerald-400">
                          {client.activePlanName}
                        </span>
                      </div>
                    ) : (
                      <AssignPlanDropdown
                        clientId={client.id}
                        plans={templates}
                        onAssign={handleAssign}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
