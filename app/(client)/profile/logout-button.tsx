'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
      }}
      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--danger)]/5 transition-colors rounded-[inherit] text-left"
    >
      <div className="w-8 h-8 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center flex-shrink-0">
        <LogOut className="w-4 h-4 text-[var(--danger)]" />
      </div>
      <span className="flex-1 text-sm font-medium text-[var(--danger)]">Cerrar sesión</span>
    </button>
  )
}
