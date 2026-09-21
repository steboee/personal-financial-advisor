import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

/**
 * The allowlist. The proxy enforces this on every request, but Server Actions
 * are POSTs to an existing route and can slip past a matcher change, so every
 * action re-checks via `requireUser()` rather than trusting the proxy alone.
 */
export const ALLOWED_EMAILS = ['ctibor.kovalcik@gmail.com'] as const

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim() as (typeof ALLOWED_EMAILS)[number])
}

/**
 * The Data Access Layer entry point: returns the signed-in, allowlisted user
 * or redirects to the login page. Call this at the top of every Server Action,
 * Route Handler and protected page — the proxy is only an optimistic
 * pre-filter and must not be the sole check.
 *
 * Memoized per render pass, so several components can call it without
 * re-verifying the token each time.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isAllowedEmail(user.email)) redirect('/login?error=not_allowed')

  return { user, supabase }
})
