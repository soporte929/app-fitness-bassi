import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Si es un enlace de invitación, redirigir a set-password
  if (type === 'invite' || type === 'signup') {
    return NextResponse.redirect(`${origin}/set-password`)
  }

  return NextResponse.redirect(`${origin}/today`)
}
