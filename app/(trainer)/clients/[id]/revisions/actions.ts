'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type RevisionInsert = Database['public']['Tables']['revisions']['Insert']
type RevisionMeasurementInsert = Database['public']['Tables']['revision_measurements']['Insert']

const TRAINER_ID = '8f500a88-a31d-45c5-9470-9cd09a2f793a'

export async function createRevision(clientId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()

  const revision_date = formData.get('revision_date') as string
  const next_revision_date = (formData.get('next_revision_date') as string) || null
  const notes = (formData.get('notes') as string) || null
  const trainer_feedback = (formData.get('trainer_feedback') as string) || null

  const revisionInsert: RevisionInsert = {
    client_id: clientId,
    trainer_id: TRAINER_ID,
    revision_date,
    notes,
    trainer_feedback,
    next_revision_date,
  }

  const { data: revision, error } = await supabase
    .from('revisions')
    .insert(revisionInsert)
    .select('id')
    .single()

  if (error || !revision) return

  const measurementFields = [
    'weight_kg',
    'body_fat_pct',
    'waist_cm',
    'hip_cm',
    'chest_cm',
    'arm_cm',
    'thigh_cm',
    'kcal_target',
  ] as const

  const measurementData: RevisionMeasurementInsert = { revision_id: revision.id }
  let hasMeasurements = false

  for (const field of measurementFields) {
    const raw = formData.get(field) as string
    if (raw && raw.trim() !== '') {
      measurementData[field] = parseFloat(raw)
      hasMeasurements = true
    }
  }

  const measurementNotes = (formData.get('measurement_notes') as string) || null
  if (measurementNotes) {
    measurementData.notes = measurementNotes
    hasMeasurements = true
  }

  if (hasMeasurements) {
    await supabase.from('revision_measurements').insert(measurementData)
  }

  redirect(`/clients/${clientId}/revisions`)
}

export async function updateTrainerFeedback(
  revisionId: string,
  feedback: string
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('revisions')
    .update({ trainer_feedback: feedback })
    .eq('id', revisionId)

  revalidatePath('/clients', 'layout')
}
