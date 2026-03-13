'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageTransition } from '@/components/ui/page-transition'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (!hash) {
      router.replace('/today')
      return
    }

    const params = new URLSearchParams(hash)
    const errorParam = params.get('error')
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (errorParam) {
      setError('El enlace ha expirado o no es válido. Contacta con tu entrenador para recibir una nueva invitación.')
      return
    }

    if ((type === 'invite' || type === 'signup' || type === 'recovery') && accessToken && refreshToken) {
      const supabase = createClient()
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(() => {
        router.replace('/set-password')
      })
      return
    }

    // Fallback para otros tipos (magic link, etc.)
    if (accessToken && refreshToken) {
      const supabase = createClient()
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(() => {
        router.replace('/today')
      })
      return
    }

    router.replace('/today')
  }, [router])

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-[#e5e5ea]">
            <div className="w-12 h-12 rounded-full bg-[#ff375f]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#ff375f] text-xl">!</span>
            </div>
            <h1 className="text-base font-semibold text-[#1d1d1f] mb-2">Enlace no válido</h1>
            <p className="text-sm text-[#6e6e73]">{error}</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <p className="text-sm text-[#6e6e73]">Verificando acceso…</p>
      </div>
    </PageTransition>
  )
}
