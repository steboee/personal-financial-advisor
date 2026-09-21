import Link from 'next/link'
import { WalletIcon } from 'lucide-react'

import { LoginForm } from '@/components/login-form'
import { getDictionary } from '@/i18n/dictionaries'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const dict = await getDictionary()
  const l = dict.login
  const errors: Record<string, string> = l.errors
  const message = error ? (errors[error] ?? l.errors.generic) : null

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <WalletIcon className="size-4" />
            </div>
            {dict.nav.appName}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm
              next={next}
              error={message}
              labels={{
                title: l.title,
                subtitle: l.subtitle,
                button: l.button,
                redirecting: l.redirecting,
                privacy: l.privacy,
              }}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex flex-col justify-center gap-8 p-12">
          <div>
            <p className="text-sm text-muted-foreground">{l.heroEyebrow}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-balance">
              {l.heroTitle}
            </p>
          </div>
          <dl className="flex flex-col gap-6">
            {(
              [
                { label: dict.buckets.needs, target: 50 },
                { label: dict.buckets.wants, target: 30 },
                { label: dict.buckets.savings, target: 20 },
              ] as const
            ).map(({ label, target }) => (
              <div key={label}>
                <div className="flex items-baseline justify-between">
                  <dt className="text-sm font-medium">{label}</dt>
                  <dd className="text-sm text-muted-foreground">{target}%</dd>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${target}%` }} />
                </div>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted-foreground">
            {l.heroBody}
          </p>
        </div>
      </div>
    </div>
  )
}
