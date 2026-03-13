import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/ui/page-transition'
import { RoutineBuilder } from '@/components/trainer/routine-builder'
import type { RoutineBuilderInitial } from '../types'

function buildDefaultInitial(): RoutineBuilderInitial {
  const daysPerWeek = 3
  return {
    name: '',
    description: '',
    days_per_week: daysPerWeek,
    days: Array.from({ length: daysPerWeek }, (_, index) => ({
      name: `Día ${index + 1}`,
      exercises: [],
    })),
  }
}

export default async function NewRoutineTemplatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const initial = buildDefaultInitial()

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/routines-templates"
            className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-overlay)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Nueva rutina</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Configura información básica, días y ejercicios
            </p>
          </div>
        </div>

        <RoutineBuilder initial={initial} />
      </div>
    </PageTransition>
  )
}
