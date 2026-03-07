'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, UserPlus } from 'lucide-react'
import { assignPlanToClient } from '../actions'

type Client = { id: string; name: string }

export function AssignClientDropdown({
  planId,
  availableClients,
}: {
  planId: string
  availableClients: Client[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleAssign = async (clientId: string) => {
    setLoading(clientId)
    await assignPlanToClient(planId, clientId)
    setLoading(null)
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
        style={{
          background: 'rgba(107,127,163,0.15)',
          color: '#6b7fa3',
          border: '1px solid rgba(107,127,163,0.3)',
        }}
      >
        <UserPlus size={14} />
        Asignar a cliente
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-2 z-50 rounded-xl overflow-hidden w-72"
            style={{
              background: '#2a2a2a',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
            }}
          >
            {availableClients.length === 0 ? (
              <p className="px-4 py-3 text-sm" style={{ color: '#a0a0a0' }}>
                Todos los clientes tienen este plan
              </p>
            ) : (
              availableClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleAssign(c.id)}
                  disabled={loading === c.id}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-left disabled:opacity-40"
                  style={{
                    color: '#e8e8e6',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(107,127,163,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(107,127,163,0.15)' }}
                    >
                      <span className="text-xs font-semibold" style={{ color: '#6b7fa3' }}>
                        {c.name[0]}
                      </span>
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <Plus size={14} color="#6b7fa3" />
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
