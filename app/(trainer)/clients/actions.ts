'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  ActivityLevel,
  Goal,
  Lifestyle,
  Objective,
  Phase,
  TrainingDays,
} from '@/lib/supabase/types'

function phaseToGoal(phase: Phase): Goal {
  if (phase === 'deficit') return 'deficit'
  if (phase === 'surplus') return 'surplus'
  return 'maintenance'
}

function objectiveToGoal(objective: Objective | null, phase: Phase): Goal {
  if (!objective) return phaseToGoal(phase)
  if (objective === 'lose_fat') return 'deficit'
  if (objective === 'gain_muscle') return 'surplus'
  return 'maintenance'
}

// NOTE: Ensure this RLS policy exists in Supabase SQL Editor:
//   CREATE POLICY "trainer_update_clients" ON clients
//     FOR UPDATE USING (trainer_id = auth.uid());
export async function updateClientAction(
  clientId: string,
  data: {
    weight_kg: number
    body_fat_pct: number | null
    phase: Phase
    objective: Objective | null
    age: number | null
    height_cm: number | null
    lifestyle: Lifestyle | null
    training_days: TrainingDays | null
    activity_level: ActivityLevel
    daily_steps: number
    trainer_notes: string | null
  }
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const goal = objectiveToGoal(data.objective, data.phase)
  const { error } = await supabase
    .from('clients')
    .update({
      weight_kg: data.weight_kg,
      body_fat_pct: data.body_fat_pct,
      phase: data.phase,
      goal,
      objective: data.objective,
      age: data.age,
      height_cm: data.height_cm,
      lifestyle: data.lifestyle,
      training_days: data.training_days,
      activity_level: data.activity_level,
      daily_steps: data.daily_steps,
      trainer_notes: data.trainer_notes,
    })
    .eq('id', clientId)
    .eq('trainer_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/clients')
  revalidateTag('trainer-dashboard', {})
}

export async function createClientAction(data: {
  email: string
  full_name: string
  phase: Phase
  objective: Objective | null
  weight_kg: number
  body_fat_pct: number | null
  age: number | null
  height_cm: number | null
  lifestyle: Lifestyle | null
  training_days: TrainingDays | null
  activity_level: ActivityLevel
  daily_steps: number
  target_weight_kg: number | null
  joined_date: string
  trainer_notes: string | null
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Verificar email único en profiles
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .maybeSingle()

  if (existing) return { success: false, error: 'Ya existe un cliente con ese email' }

  // 1. Crear usuario en auth.users primero (admin client bypass RLS)
  const admin = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
    data.email,
    {
      redirectTo: `${siteUrl}/auth/callback?next=/set-password`,
      data: {
        full_name: data.full_name,
      },
    }
  )
  if (authError) return { success: false, error: authError.message }

  const profileId = authData.user.id

  // 2. Upsert profile con el ID real de auth.users
  // (upsert por si hay trigger que ya lo creó automáticamente)
  const { error: profileError } = await admin.from('profiles').upsert({
    id: profileId,
    email: data.email,
    full_name: data.full_name,
    role: 'client' as const,
    avatar_url: null,
  })

  if (profileError) {
    // Rollback: borrar el usuario de auth para no dejar datos huérfanos
    await admin.auth.admin.deleteUser(profileId)
    return { success: false, error: profileError.message }
  }

  // Crear registro de cliente
  // PRODUCTION: requires SUPABASE_SERVICE_ROLE_KEY env var in Vercel
  const goal = objectiveToGoal(data.objective, data.phase)
  const { data: newClient, error: clientError } = await admin
    .from('clients')
    .insert({
      profile_id: profileId,
      trainer_id: user.id,
      phase: data.phase,
      goal,
      objective: data.objective,
      weight_kg: data.weight_kg,
      body_fat_pct: data.body_fat_pct,
      age: data.age,
      height_cm: data.height_cm,
      lifestyle: data.lifestyle,
      training_days: data.training_days,
      activity_level: data.activity_level,
      daily_steps: data.daily_steps,
      target_weight_kg: data.target_weight_kg,
      joined_date: data.joined_date,
      trainer_notes: data.trainer_notes,
      active: true,
    })
    .select('id')
    .single()

  if (clientError) {
    // Rollback: borrar usuario de auth y profile huérfano
    await admin.auth.admin.deleteUser(profileId)
    return { success: false, error: clientError.message }
  }

  revalidatePath('/clients')
  revalidateTag('trainer-dashboard', {})
  return { success: true, id: newClient.id }
}

export async function assignPlanToClientAction(
  planId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Deactivate any existing active plan for this client
  await supabase
    .from('client_plans')
    .update({ active: false })
    .eq('client_id', clientId)
    .eq('active', true)

  const { error } = await supabase
    .from('client_plans')
    .insert({ client_id: clientId, plan_id: planId, active: true })

  if (error) return { success: false, error: error.message }
  revalidatePath('/clients')
  revalidatePath(`/clients/${clientId}`)
  revalidateTag('trainer-dashboard', {})
  return { success: true }
}

export async function deleteClientAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Seguridad: verificar que el cliente pertenece al trainer
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!client) return { success: false, error: 'Cliente no encontrado' }

  const { error } = await supabase
    .from('clients')
    .update({ active: false })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  revalidateTag('trainer-dashboard', {})
  return { success: true }
}
