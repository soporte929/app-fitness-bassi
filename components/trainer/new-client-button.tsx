'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateClientModal } from './create-client-modal'
import { Plus } from 'lucide-react'

export function NewClientButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="md" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Nuevo cliente
      </Button>
      <CreateClientModal open={open} onOpenChange={setOpen} />
    </>
  )
}
