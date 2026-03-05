import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { LogoutButton } from './logout-button'
import { User, Bell, Ruler, Shield, ChevronRight, Flame, Trophy } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Phase = Database['public']['Tables']['clients']['Row']['phase']

const PHASE_LABELS: Record<Phase, string> = {
  deficit: 'Déficit',
  maintenance: 'Mantenimiento',
  surplus: 'Superávit',
}

function calcStreak(sessions: { started_at: string }[]): number {
  if (sessions.length === 0) return 0
  const dates = new Set(sessions.map((s) => s.started_at.substring(0, 10)))
  const now = new Date()
  let current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (!dates.has(current.toISOString().substring(0, 10))) {
    current = new Date(current.getTime() - 86400000)
  }
  let streak = 0
  while (dates.has(current.toISOString().substring(0, 10))) {
    streak++
    current = new Date(current.getTime() - 86400000)
  }
  return streak
}

const settingsSections = [
  {
    title: 'Cuenta',
    items: [
      { label: 'Datos personales', icon: User },
      { label: 'Notificaciones', icon: Bell },
      { label: 'Unidades de medida', icon: Ruler },
    ],
  },
  {
    title: 'App',
    items: [{ label: 'Privacidad', icon: Shield }],
  },
]

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  let streak = 0
  let totalWorkouts = 0
  let adherence = 0
  let joinedDate = ''
  let phaseLabel = ''

  if (profile.role === 'client') {
    const { data: clientRecord } = await supabase
      .from('clients')
      .select('id, phase, joined_date')
      .eq('profile_id', user.id)
      .single()

    if (clientRecord) {
      const [totalRes, completedRes, streakRes] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientRecord.id),
        supabase
          .from('workout_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientRecord.id)
          .eq('completed', true),
        supabase
          .from('workout_sessions')
          .select('started_at')
          .eq('client_id', clientRecord.id)
          .eq('completed', true)
          .order('started_at', { ascending: false })
          .limit(365),
      ])

      const total = totalRes.count ?? 0
      const completed = completedRes.count ?? 0
      totalWorkouts = completed
      adherence = total > 0 ? Math.round((completed / total) * 100) : 0
      streak = calcStreak(streakRes.data ?? [])
      joinedDate = new Date(clientRecord.joined_date + 'T00:00:00').toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
      phaseLabel = PHASE_LABELS[clientRecord.phase]
    }
  }

  const initial = profile.full_name?.[0]?.toUpperCase() ?? '?'

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-6">Perfil</h1>

        {/* User card */}
        <Card className="mb-5">
          <CardContent className="py-5 px-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[var(--accent)] text-xl font-bold">{initial}</span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-[var(--text-primary)] truncate">{profile.full_name}</p>
                <p className="text-sm text-[var(--text-secondary)] truncate">{profile.email}</p>
                {profile.role === 'client' && phaseLabel && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {phaseLabel}{joinedDate && ` · Desde ${joinedDate}`}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats — solo para clientes */}
        {profile.role === 'client' && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <Card>
              <CardContent className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-[var(--warning)]" />
                </div>
                <p className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)]">{streak}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-medium">días racha</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <p className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)]">{totalWorkouts}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-medium">entrenos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-3 text-center">
                <div className="mb-1 h-3.5" />
                <p className="text-lg font-bold text-[var(--success)] font-[family-name:var(--font-geist-mono)]">{adherence}%</p>
                <p className="text-[10px] text-[var(--text-muted)] font-medium">adherencia</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings */}
        {settingsSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1 mb-2">
              {section.title}
            </p>
            <Card>
              <CardContent className="p-0">
                {section.items.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 px-5 min-h-[52px] ${i < section.items.length - 1 ? 'border-b border-[var(--border)]' : ''
                        }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Logout */}
        <Card className="mt-2">
          <CardContent className="p-0">
            <LogoutButton />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">Fitness Bassi v1.0</p>
      </div>
    </PageTransition>
  )
}
