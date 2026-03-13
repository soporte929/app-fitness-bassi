'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/page-transition'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      router.push('/today')
    } catch {
      setError('Ha ocurrido un error inesperado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
              Establece tu contraseña
            </h1>
            <p className="mt-2 text-sm text-[#6e6e73]">
              Crea una contraseña para acceder a tu cuenta de Fitness Bassi.
            </p>
          </div>

          <Card className="border-[#e5e5ea]">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-[#6e6e73] uppercase tracking-wider"
                  >
                    Nueva contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    className="w-full rounded-lg border border-[#e5e5ea] bg-white px-3 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:border-[#0071e3] focus:outline-none focus:ring-1 focus:ring-[#0071e3] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-medium text-[#6e6e73] uppercase tracking-wider"
                  >
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                    className="w-full rounded-lg border border-[#e5e5ea] bg-white px-3 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:border-[#0071e3] focus:outline-none focus:ring-1 focus:ring-[#0071e3] transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[#ff375f] bg-[#ff375f]/5 border border-[#ff375f]/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0071e3] hover:bg-[#0071e3]/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Establecer contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
