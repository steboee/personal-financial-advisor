import { ShieldCheck } from 'lucide-react'

import { GoogleSignInButton } from './_components/google-sign-in-button'

const ERROR_MESSAGES: Record<string, string> = {
  not_allowed: 'That account is not on the allowlist. Ask the owner for access.',
  oauth_failed: 'Google sign-in did not complete. Please try again.',
  missing_code: 'The sign-in link was incomplete. Please try again.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const message = error ? (ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.') : null

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Financial Advisor</h1>
            <p className="text-sm text-muted-foreground">
              A private dashboard for your own finances. Access is limited to approved accounts.
            </p>
          </div>
        </div>

        {message && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {message}
          </p>
        )}

        <GoogleSignInButton next={next} />

        <p className="text-center text-xs text-muted-foreground">
          Your bank data never leaves your own Supabase project.
        </p>
      </div>
    </main>
  )
}
