import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus } from 'lucide-react'
import { FeedbackEditor } from './feedback-editor'
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

export default async function TrainerClientRevisionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawClient } = await supabase
    .from('clients')
    .select('id, profile:profiles!clients_profile_id_fkey (full_name)')
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!rawClient) notFound()

  const profile = rawClient.profile as { full_name: string } | null
  const clientName = profile?.full_name ?? 'Cliente'

  const { data: rawRevisions } = await supabase
    .from('revisions')
    .select('*, revision_measurements(*), revision_photos(*)')
    .eq('client_id', id)
    .order('revision_date', { ascending: false })

  const revisions = (rawRevisions ?? []) as Revision[]

  return (
    <div className="min-h-screen p-5 lg:p-8" style={{ background: '#191919', color: '#e8e8e6' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-3">
          <Link
            href={`/clients/${id}`}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#a0a0a0' }} />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e8e8e6' }}>
              Revisiones
            </h1>
            <p className="text-sm" style={{ color: '#666' }}>
              {clientName}
            </p>
          </div>
        </div>
        <Link
          href={`/clients/${id}/revisions/new`}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md transition-opacity hover:opacity-80"
          style={{ background: '#e8e8e6', color: '#191919' }}
        >
          <Plus className="w-4 h-4" />
          Nueva revisión
        </Link>
      </div>

      {/* Empty state */}
      {revisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-base font-semibold mb-1" style={{ color: '#e8e8e6' }}>
            Sin revisiones
          </p>
          <p className="text-sm mb-6" style={{ color: '#666' }}>
            Crea la primera revisión de {clientName}
          </p>
          <Link
            href={`/clients/${id}/revisions/new`}
            className="text-sm font-semibold px-5 py-2.5 rounded-md"
            style={{ background: '#e8e8e6', color: '#191919' }}
          >
            Crear primera revisión
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {revisions.map((rev) => {
            const m = rev.revision_measurements?.[0] ?? null

            return (
              <div
                key={rev.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: '#212121',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Card header */}
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-base font-bold" style={{ color: '#e8e8e6' }}>
                    {fmtDate(rev.revision_date)}
                  </p>
                  {rev.next_revision_date && (
                    <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                      Próxima revisión: {fmtDate(rev.next_revision_date)}
                    </p>
                  )}
                </div>

                {/* Métricas */}
                {m && (m.weight_kg != null || m.waist_cm != null || m.body_fat_pct != null || m.hip_cm != null || m.chest_cm != null || m.arm_cm != null || m.thigh_cm != null) && (
                  <div
                    className="px-5 py-3 flex flex-wrap gap-5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {[
                      { label: 'Peso', value: m.weight_kg, unit: ' kg' },
                      { label: 'Cintura', value: m.waist_cm, unit: ' cm' },
                      { label: 'Grasa', value: m.body_fat_pct, unit: '%' },
                      { label: 'Cadera', value: m.hip_cm, unit: ' cm' },
                      { label: 'Pecho', value: m.chest_cm, unit: ' cm' },
                      { label: 'Brazo', value: m.arm_cm, unit: ' cm' },
                      { label: 'Muslo', value: m.thigh_cm, unit: ' cm' },
                    ]
                      .filter((item) => item.value != null)
                      .map((item) => (
                        <div key={item.label}>
                          <p
                            className="text-[10px] uppercase font-medium tracking-wider"
                            style={{ color: '#555' }}
                          >
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold" style={{ color: '#e8e8e6' }}>
                            {item.value}
                            {item.unit}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Notas del cliente */}
                {rev.notes && (
                  <div
                    className="px-5 py-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p
                      className="text-[10px] uppercase font-medium tracking-wider mb-1.5"
                      style={{ color: '#555' }}
                    >
                      Notas
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
                      {rev.notes}
                    </p>
                  </div>
                )}

                {/* Feedback del trainer (editable) */}
                <div className="px-5 py-4" style={{ borderBottom: rev.revision_photos?.length > 0 ? '1px solid rgba(255,255,255,0.07)' : undefined }}>
                  <p
                    className="text-[10px] uppercase font-medium tracking-wider mb-2"
                    style={{ color: '#555' }}
                  >
                    Feedback del entrenador
                  </p>
                  <FeedbackEditor
                    revisionId={rev.id}
                    initialFeedback={rev.trainer_feedback}
                  />
                </div>

                {/* Fotos */}
                {rev.revision_photos?.length > 0 && (
                  <div className="px-5 py-4">
                    <p
                      className="text-[10px] uppercase font-medium tracking-wider mb-2"
                      style={{ color: '#555' }}
                    >
                      Fotos
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {rev.revision_photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative aspect-square rounded-lg overflow-hidden"
                          style={{ background: '#2a2a2a' }}
                        >
                          <Image
                            src={photo.photo_url}
                            alt={photo.angle ?? 'Foto revisión'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {photo.angle && (
                            <span
                              className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                            >
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
  )
}
