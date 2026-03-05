'use client'

import { Play } from 'lucide-react'

export function StartWorkoutButton() {
  return (
    <button
      onClick={() => alert('Próximamente')}
      className="w-full min-h-[44px] bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold text-sm rounded-md flex items-center justify-center gap-2 transition-colors hover:opacity-90"
    >
      <Play className="w-4 h-4 fill-[var(--bg-base)] stroke-none" />
      Empezar entrenamiento
    </button>
  )
}
