'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  label: string
  value: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm text-left"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: open
            ? '1px solid #6b7fa3'
            : '1px solid rgba(255,255,255,0.08)',
          color: selected ? '#e8e8e6' : '#555',
          boxShadow: open ? '0 0 0 3px rgba(107,127,163,0.15)' : 'none',
          transition: 'border 200ms, box-shadow 200ms',
        }}
      >
        <span>{selected?.label ?? placeholder ?? 'Seleccionar'}</span>
        <ChevronDown
          size={14}
          color="#a0a0a0"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 200ms',
          }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden"
            style={{
              background: '#2a2a2a',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-left"
                style={{
                  color: opt.value === value ? '#e8e8e6' : '#a0a0a0',
                  background:
                    opt.value === value ? 'rgba(107,127,163,0.12)' : 'transparent',
                  transition: 'background 150ms',
                }}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={12} color="#6b7fa3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
