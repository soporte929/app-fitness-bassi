'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AssignTemplateModal } from '@/components/trainer/assign-template-modal'
import type { RoutineClientOption } from '@/app/(trainer)/routines-templates/types'

type Props = {
  planId: string
  planName: string
  clients: RoutineClientOption[]
  defaultClientId?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AssignTemplateButton({
  planId,
  planName,
  clients,
  defaultClientId,
  variant = 'secondary',
  size = 'sm',
  className,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={variant} size={size} className={className}>
        Asignar a cliente
      </Button>
      <AssignTemplateModal
        open={open}
        onOpenChange={setOpen}
        planId={planId}
        planName={planName}
        clients={clients}
        defaultClientId={defaultClientId}
        onAssigned={(newPlanId) => router.push(`/routines-templates/${newPlanId}`)}
      />
    </>
  )
}
