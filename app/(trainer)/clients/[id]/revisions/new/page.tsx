import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createRevision } from '../actions'

export default async function NewRevisionPage({
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

  const todayISO = new Date().toISOString().split('T')[0]

  const boundAction = createRevision.bind(null, id)

  const inputStyle = {
    background: '#2a2a2a',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e8e8e6',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
  } as React.CSSProperties

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#888',
    marginBottom: '0.375rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }

  return (
    <div className="min-h-screen p-5 lg:p-8" style={{ background: '#191919', color: '#e8e8e6' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link
          href={`/clients/${id}/revisions`}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#a0a0a0' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#e8e8e6' }}>
            Nueva revisión
          </h1>
          <p className="text-sm" style={{ color: '#666' }}>
            {clientName}
          </p>
        </div>
      </div>

      <form action={boundAction} className="space-y-6 max-w-2xl">
        {/* Fechas */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#e8e8e6' }}>
            Fechas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle} htmlFor="revision_date">
                Fecha de revisión *
              </label>
              <input
                id="revision_date"
                name="revision_date"
                type="date"
                defaultValue={todayISO}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="next_revision_date">
                Próxima revisión (opcional)
              </label>
              <input
                id="next_revision_date"
                name="next_revision_date"
                type="date"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#e8e8e6' }}>
            Métricas <span style={{ color: '#555', fontWeight: 400 }}>(opcionales)</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'weight_kg', label: 'Peso (kg)' },
              { name: 'body_fat_pct', label: 'Grasa (%)' },
              { name: 'waist_cm', label: 'Cintura (cm)' },
              { name: 'hip_cm', label: 'Cadera (cm)' },
              { name: 'chest_cm', label: 'Pecho (cm)' },
              { name: 'arm_cm', label: 'Brazo (cm)' },
              { name: 'thigh_cm', label: 'Muslo (cm)' },
              { name: 'kcal_target', label: 'Kcal objetivo' },
            ].map((field) => (
              <div key={field.name}>
                <label style={labelStyle} htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="—"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <div>
            <label style={labelStyle} htmlFor="measurement_notes">
              Notas de métricas
            </label>
            <input
              id="measurement_notes"
              name="measurement_notes"
              type="text"
              placeholder="Observaciones sobre las mediciones..."
              style={inputStyle}
            />
          </div>
        </div>

        {/* Notas y feedback */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#e8e8e6' }}>
            Notas y feedback
          </p>
          <div>
            <label style={labelStyle} htmlFor="notes">
              Notas del cliente (opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Cómo se ha sentido el cliente, observaciones generales..."
              style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="trainer_feedback">
              Feedback del entrenador (opcional)
            </label>
            <textarea
              id="trainer_feedback"
              name="trainer_feedback"
              rows={4}
              placeholder="Recomendaciones, ajustes de plan, motivación..."
              style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="font-semibold text-sm px-6 py-2.5 rounded-md transition-opacity hover:opacity-80"
            style={{ background: '#e8e8e6', color: '#191919' }}
          >
            Guardar revisión
          </button>
          <Link
            href={`/clients/${id}/revisions`}
            className="text-sm px-4 py-2.5 rounded-md transition-colors"
            style={{ color: '#888' }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
