'use client'

import { useState, useTransition } from 'react'
import { updateTrainerFeedback } from './actions'

interface Props {
  revisionId: string
  initialFeedback: string | null
}

export function FeedbackEditor({ revisionId, initialFeedback }: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialFeedback ?? '')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateTrainerFeedback(revisionId, value)
      setSaved(true)
      setOpen(false)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3">
        {initialFeedback ? (
          <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
            {initialFeedback}
          </p>
        ) : (
          <p className="text-sm" style={{ color: '#555' }}>
            Sin feedback
          </p>
        )}
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          style={{ background: 'rgba(232,232,230,0.08)', color: '#e8e8e6', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {saved ? '¡Guardado!' : 'Editar feedback'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Escribe el feedback para el cliente..."
        className="w-full rounded-md px-3 py-2.5 text-sm resize-none outline-none focus:ring-1 transition-all"
        style={{
          background: '#2a2a2a',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#e8e8e6',
          lineHeight: '1.6',
        }}
        autoFocus
      />
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => {
            setValue(initialFeedback ?? '')
            setOpen(false)
          }}
          className="text-xs px-3 py-1.5 rounded-md transition-colors"
          style={{ color: '#888' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-xs font-semibold px-4 py-1.5 rounded-md transition-opacity disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
