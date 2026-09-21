'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.58-5.17 3.58-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

export function GoogleSignInButton({ next }: { next?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signIn() {
    setPending(true)
    const supabase = createClient()
    const callback = new URL('/auth/callback', window.location.origin)
    if (next) callback.searchParams.set('next', next)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callback.toString(),
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })

    // On success the browser navigates away, so we only land here on failure.
    if (error) {
      setPending(false)
      router.push('/login?error=oauth_failed')
    }
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={pending}
      className="press text-body inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-primary px-[22px] text-primary-foreground transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-[18px] animate-spin" aria-hidden />
      ) : (
        <span className="flex size-[18px] items-center justify-center rounded-full bg-white">
          <GoogleMark />
        </span>
      )}
      {pending ? 'Redirecting\u2026' : 'Continue with Google'}
    </button>
  )
}
