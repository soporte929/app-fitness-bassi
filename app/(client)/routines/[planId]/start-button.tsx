'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw } from 'lucide-react'
import { startWorkoutSession } from './actions'

export function StartWorkoutButton({
  dayId,
  hasActiveSession,
}: {
  dayId: string
  hasActiveSession: boolean
}) {
  const [isPending, startTransition] = useTransition()

  if (hasActiveSession) {
    return (
      <Link href="/today" className="block w-full">
        <Button size="lg" className="w-full">
          <RotateCcw className="w-5 h-5" />
          Reanudar entrenamiento
        </Button>
      </Link>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isPending || !dayId}
      onClick={() => startTransition(() => startWorkoutSession(dayId))}
    >
      {isPending ? (
        <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <Play className="w-5 h-5" />
      )}
      {isPending ? 'Iniciando...' : 'Empezar Rutina'}
    </Button>
  )
}
