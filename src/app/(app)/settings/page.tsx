import { LogOutIcon } from 'lucide-react'

import { LanguageSwitcher } from '@/components/language-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getDictionary, getLocale } from '@/i18n/dictionaries'
import { requireUser } from '@/lib/auth'
import { formatDateLong } from '@/lib/finance/format'
import { getDataStats } from '@/lib/finance/queries'

export const metadata = { title: 'Settings · Financial Advisor' }

/** A label/value row, used throughout the page. */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  )
}

export default async function SettingsPage() {
  const { user } = await requireUser()
  const [dict, locale, stats] = await Promise.all([getDictionary(), getLocale(), getDataStats()])
  const s = dict.settings

  const name = (user.user_metadata?.full_name as string | undefined) ?? null
  const avatar = (user.user_metadata?.avatar_url as string | undefined) ?? ''
  const initials = (name ?? user.email ?? '')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const dateTime = new Intl.DateTimeFormat(locale === 'sk' ? 'sk-SK' : 'en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>

      <div className="mt-6 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{s.profile.title}</CardTitle>
            <CardDescription>{s.profile.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                {avatar && <AvatarImage src={avatar} alt="" />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{name ?? s.profile.notSet}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="divide-y">
              <Row label={s.profile.name} value={name ?? s.profile.notSet} />
              <Row label={s.profile.email} value={user.email} />
              {user.created_at && (
                <Row
                  label={s.profile.signedInSince}
                  value={dateTime.format(new Date(user.created_at))}
                />
              )}
              {user.last_sign_in_at && (
                <Row
                  label={s.profile.lastSignIn}
                  value={dateTime.format(new Date(user.last_sign_in_at))}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{s.preferences.title}</CardTitle>
            <CardDescription>{s.preferences.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{s.preferences.language}</span>
              <div className="w-44">
                <LanguageSwitcher locale={locale} label={s.preferences.language} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{s.data.title}</CardTitle>
            <CardDescription>{s.data.description}</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row label={s.data.transactions} value={stats.transactions} />
            <Row label={s.data.categories} value={stats.categories} />
            <Row label={s.data.months} value={stats.months} />
            <Row
              label={s.data.oldest}
              value={stats.oldest ? formatDateLong(stats.oldest) : s.data.none}
            />
            <Row
              label={s.data.newest}
              value={stats.newest ? formatDateLong(stats.newest) : s.data.none}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{s.account.title}</CardTitle>
            <CardDescription>{s.account.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* A POST form, so signing out is never triggered by a prefetch. */}
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline">
                <LogOutIcon />
                {s.account.logout}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
