import { NextResponse, type NextRequest } from 'next/server'

import { isAllowedEmail } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth redirect target. Exchanges the PKCE code for a session, then enforces
 * the allowlist a second time — the database trigger blocks new sign-ups, this
 * blocks anyone who somehow already has a row.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (searchParams.get('error')) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=not_allowed`)
  }

  // Only allow relative redirects, so `?next=` cannot bounce to another host.
  const target = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return NextResponse.redirect(`${origin}${target}`)
}
