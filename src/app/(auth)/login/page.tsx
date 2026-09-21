import { GoogleSignInButton } from './_components/google-sign-in-button'
import { BrandMark } from './_components/brand-mark'
import { SummaryPanel } from './_components/summary-panel'

const ERROR_MESSAGES: Record<string, string> = {
  not_allowed: 'That account is not on the allowlist. Ask the owner for access.',
  oauth_failed: 'Google sign-in did not complete. Please try again.',
  missing_code: 'The sign-in link was incomplete. Please try again.',
}

const BUCKET_CHIPS = [
  { label: '50% Needs', className: 'bg-needs-surface text-on-needs-surface' },
  { label: '30% Wants', className: 'bg-wants-surface text-on-wants-surface' },
  { label: '20% Savings', className: 'bg-savings-surface text-on-savings-surface' },
]

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const message = error ? (ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.') : null

  return (
    /* h-svh + overflow-hidden: the page never scrolls on desktop. The right
     * tile scrolls internally if a short viewport demands it. */
    <main className="flex h-svh flex-col overflow-hidden lg:flex-row">
      <div className="relative flex flex-1 flex-col overflow-hidden bg-surface px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
        {/* Background: a soft tint plus a fine grid, sitting behind content. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_40%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 -z-10 size-[30rem] rounded-full bg-needs-surface blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -bottom-40 -z-10 size-[26rem] rounded-full bg-savings-surface blur-[100px]"
        />

        <header className="flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="text-heading-16">Financial Advisor</span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="w-full max-w-[25rem]">
            <h1 className="text-display text-balance">Welcome back.</h1>
            <p className="text-lede mt-3 text-on-surface-variant">
              Review this month&rsquo;s spending against your 50/30/20 plan.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {BUCKET_CHIPS.map(({ label, className }) => (
                <li
                  key={label}
                  className={`text-caption rounded-full px-3 py-1 font-medium ${className}`}
                >
                  {label}
                </li>
              ))}
            </ul>

            {message && (
              <p
                role="alert"
                className="text-caption mt-6 rounded-xl bg-error-surface px-4 py-3 text-on-error-surface"
              >
                {message}
              </p>
            )}

            <div className="mt-8">
              <GoogleSignInButton next={next} />
            </div>

            <p className="text-caption mt-5 text-on-surface-variant">
              Access is limited to approved accounts. Your data stays in your own Supabase project.
            </p>
          </div>
        </div>

        <footer className="text-caption text-on-surface-variant">
          &copy; {new Date().getFullYear()} Financial Advisor
        </footer>
      </div>

      <SummaryPanel />
    </main>
  )
}
