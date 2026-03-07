'use client'

import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deletePlan } from './actions'

export function DeletePlanButton({ planId }: { planId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este plan? Esta acción no se puede deshacer.')) return
    const result = await deletePlan(planId)
    if (result.success) router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-1.5 text-xs text-[#a0a0a0] hover:text-[#ff6b6b] transition-colors px-3 py-2 rounded-lg hover:bg-[rgba(255,107,107,0.08)]"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Eliminar
    </button>
  )
}
