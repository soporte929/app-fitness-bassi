'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type SelectCtx = {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
  disabled: boolean
  registerLabel: (value: string, label: string) => void
  getLabel: (value: string) => string | undefined
}

const Ctx = createContext<SelectCtx | null>(null)

function useCtx() {
  const c = useContext(Ctx)
  if (!c) throw new Error('Select subcomponent used outside <Select>')
  return c
}

export function Select({
  value,
  onValueChange,
  disabled = false,
  children,
}: {
  value: string
  onValueChange: (v: string) => void
  disabled?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const labels = useRef(new Map<string, string>())

  const registerLabel = useCallback((v: string, label: string) => {
    labels.current.set(v, label)
  }, [])

  const getLabel = useCallback((v: string) => labels.current.get(v), [])

  return (
    <Ctx.Provider value={{ value, onValueChange, open, setOpen, disabled, registerLabel, getLabel }}>
      <div className="relative">{children}</div>
    </Ctx.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const { open, setOpen, disabled } = useCtx()

  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      className={cn(
        'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm border transition-colors text-left',
        'bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-primary)]',
        'hover:border-[var(--border-hover)] focus:outline-none focus:border-[var(--accent)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span className="flex-1 truncate">{children}</span>
      <ChevronDown
        className={cn(
          'w-4 h-4 text-[var(--text-muted)] ml-2 flex-shrink-0 transition-transform duration-150',
          open && 'rotate-180'
        )}
      />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, getLabel } = useCtx()
  const label = value ? getLabel(value) : undefined

  if (!label) {
    return <span className="text-[var(--text-muted)]">{placeholder ?? ''}</span>
  }
  return <span>{label}</span>
}

export function SelectContent({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const { open, setOpen } = useCtx()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={cn(
          'absolute top-full left-0 right-0 z-20 mt-1 rounded-md border shadow-md overflow-y-auto',
          'bg-[var(--bg-elevated)] border-[var(--border-hover)]',
          'max-h-60',
          !open && 'hidden',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

export function SelectItem({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { value: selected, onValueChange, setOpen, registerLabel } = useCtx()

  // Register label synchronously so SelectValue can read it
  if (typeof children === 'string') {
    registerLabel(value, children)
  }

  return (
    <button
      type="button"
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
      className={cn(
        'flex items-center w-full px-3 py-2 text-sm text-left transition-colors',
        'hover:bg-[var(--bg-overlay)] text-[var(--text-primary)]',
        className
      )}
    >
      <Check
        className={cn(
          'w-3.5 h-3.5 mr-2 flex-shrink-0 text-[var(--accent)]',
          selected === value ? 'opacity-100' : 'opacity-0'
        )}
      />
      {children}
    </button>
  )
}
