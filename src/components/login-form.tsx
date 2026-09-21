'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from 'cn'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { createClient } from '@/lib/supabase/client'

export function LoginForm({
  className,
  next,
  error,
  labels,
  ...props
}: React.ComponentProps<'div'> & {
  next?: string
  error?: string | null
  labels: {
    title: string
    subtitle: string
    button: string
    redirecting: string
    privacy: string
  }
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signIn() {
    setPending(true)
    const supabase = createClient()
    const callback = new URL('/auth/callback', window.location.origin)
    if (next) callback.searchParams.set('next', next)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callback.toString(),
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })

    // On success the browser navigates away, so we only land here on failure.
    if (oauthError) {
      setPending(false)
      router.push('/login?error=oauth_failed')
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{labels.title}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {labels.subtitle}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Field>
          <Button variant="outline" type="button" onClick={signIn} disabled={pending}>
            {pending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
            )}
            {pending ? labels.redirecting : labels.button}
          </Button>
          <FieldDescription className="text-center">
            {labels.privacy}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  )
}
