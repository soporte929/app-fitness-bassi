'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(data: {
  full_name: string
  avatar_url: string | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name.trim() || undefined,
      avatar_url: data.avatar_url?.trim() || null,
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/profile')
  return { success: true }
}
