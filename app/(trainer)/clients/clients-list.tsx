'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Search, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ClientItem = {
  id: string
  name: string
  phase: string
  status: 'green' | 'yellow' | 'red'
  adherence: number
  lastWorkout: string
  weightKg: number
  alert: string | null
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

export function ClientsListUI({ clients }: { clients: ClientItem[] }) {
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
        <div className="space-y-2 stagger">
          {filtered.map((client, i) => (
            <Card
              key={client.id}
              className="card-hover cursor-pointer animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => router.push(`/clients/${client.id}`)}
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{client.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{client.name}</span>
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
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-[var(--text-secondary)]">{client.phase}</span>
                      <span className="text-xs text-[var(--text-muted)]">·</span>
                      <span className="text-xs text-[var(--text-secondary)]">{client.lastWorkout}</span>
                      {client.alert && (
                        <>
                          <span className="text-xs text-[var(--text-muted)]">·</span>
                          <span className="text-xs text-[var(--danger)]">{client.alert}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          client.adherence >= 80
                            ? 'text-[var(--success)]'
                            : client.adherence >= 60
                              ? 'text-[var(--warning)]'
                              : 'text-[var(--danger)]'
                        )}
                      >
                        {client.adherence}%
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">adherencia</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
