import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { User, Palette } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-6">Ajustes</h1>

        <div className="space-y-4">
          {/* Sección: Cuenta */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--text-secondary)]" />
                <p className="text-base font-semibold text-[var(--text-primary)]">Cuenta</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Nombre</p>
                  <p className="text-sm text-[var(--text-primary)]">{profile?.full_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm text-[var(--text-primary)]">{profile?.email ?? user.email ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Rol</p>
                  <p className="text-sm text-[var(--text-primary)]">Entrenador</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección: Apariencia */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--text-secondary)]" />
                <p className="text-base font-semibold text-[var(--text-primary)]">Apariencia</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Modo de color</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Claro u oscuro según tu preferencia</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
