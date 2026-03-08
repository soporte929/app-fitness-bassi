'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

interface Plan {
  id: string
  name: string
}

interface AssignPlanDropdownProps {
  clientId: string
  plans: Plan[]
  onAssign: (clientId: string, planId: string) => Promise<void>
}

export function AssignPlanDropdown({ clientId, plans, onAssign }: AssignPlanDropdownProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside() {
      setOpen(false)
    }
    if (open) {
      setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen(!open)
  }

  async function handleAssign(planId: string) {
    setLoading(true)
    await onAssign(clientId, planId)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-all disabled:opacity-50"
      >
        {loading ? 'Asignando…' : '+ Asignar plan'}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'absolute',
            top: coords.top,
            right: coords.right,
            backgroundColor: '#1e1e1e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            width: '208px',
            zIndex: 9999,
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Seleccionar plan
            </p>
          </div>
          <div style={{ padding: '4px' }}>
            {plans.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', padding: '8px 12px' }}>
                Sin planes disponibles
              </p>
            ) : (
              plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleAssign(plan.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 500 }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {plan.name}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
