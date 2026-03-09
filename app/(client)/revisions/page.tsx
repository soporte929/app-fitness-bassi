import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { PageTransition } from '@/components/ui/page-transition'
import { ClipboardList } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type RevisionRow = Database['public']['Tables']['revisions']['Row']
type RevisionMeasurementRow = Database['public']['Tables']['revision_measurements']['Row']
type RevisionPhotoRow = Database['public']['Tables']['revision_photos']['Row']
type Revision = RevisionRow & {
  revision_measurements: RevisionMeasurementRow[]
  revision_photos: RevisionPhotoRow[]
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function RevisionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!client) redirect('/login')

  const { data: rawRevisions } = await supabase
    .from('revisions')
    .select('*, revision_measurements(*), revision_photos(*)')
    .eq('client_id', client.id)
    .order('revision_date', { ascending: false })

  const revisions = (rawRevisions ?? []) as Revision[]

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-5">
          Revisiones
        </h1>

        {revisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
              Aún no tienes revisiones
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Tu entrenador registrará aquí tus revisiones periódicas
            </p>
          </div>
        ) : (
          <div className="space-y-4 stagger">
            {revisions.map((rev, i) => {
              const m = rev.revision_measurements?.[0] ?? null
              return (
                <div
                  key={rev.id}
                  className="animate-fade-in bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-hidden"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-[var(--border)]">
                    <p className="text-base font-bold text-[var(--text-primary)]">
                      {fmtDate(rev.revision_date)}
                    </p>
                    {rev.next_revision_date && (
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Próxima revisión: {fmtDate(rev.next_revision_date)}
                      </p>
                    )}
                  </div>

                  {/* Métricas */}
                  {m && (m.weight_kg != null || m.waist_cm != null || m.body_fat_pct != null) && (
                    <div className="px-5 py-3 flex flex-wrap gap-5 border-b border-[var(--border)]">
                      {m.weight_kg != null && (
                        <div>
                          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium tracking-wider">
                            Peso
                          </p>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {m.weight_kg} kg
                          </p>
                        </div>
                      )}
                      {m.waist_cm != null && (
                        <div>
                          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium tracking-wider">
                            Cintura
                          </p>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {m.waist_cm} cm
                          </p>
                        </div>
                      )}
                      {m.body_fat_pct != null && (
                        <div>
                          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium tracking-wider">
                            Grasa
                          </p>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {m.body_fat_pct}%
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback del trainer */}
                  {rev.trainer_feedback && (
                    <div className="px-5 py-4 border-b border-[var(--border)]">
                      <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium tracking-wider mb-1.5">
                        Feedback del entrenador
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {rev.trainer_feedback}
                      </p>
                    </div>
                  )}

                  {/* Fotos */}
                  {rev.revision_photos?.length > 0 && (
                    <div className="px-5 py-4">
                      <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium tracking-wider mb-2">
                        Fotos
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {rev.revision_photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative aspect-square rounded-lg overflow-hidden bg-[var(--bg-elevated)]"
                          >
                            <Image
                              src={photo.photo_url}
                              alt={photo.angle ?? 'Foto revisión'}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            {photo.angle && (
                              <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                                {photo.angle}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
