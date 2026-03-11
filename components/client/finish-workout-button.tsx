'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

type Props = {
  action: () => Promise<void>
}

export function FinishWorkoutButton({ action }: Props) {
  async function handleClick() {
    // Dispatch event BEFORE the server action so the banner clears immediately
    window.dispatchEvent(new CustomEvent('workoutFinished'))
    // Execute the server action (which will redirect to /history)
    await action()
  }

  return (
    <form action={handleClick}>
      <Button type="submit" className="w-full" size="lg">
        <CheckCircle2 className="w-5 h-5" />
        Finalizar entrenamiento
      </Button>
    </form>
  )
}
