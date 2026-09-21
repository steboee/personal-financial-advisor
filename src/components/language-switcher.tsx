'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LanguagesIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { setLocale } from '@/i18n/actions'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config'

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function change(value: string | null) {
    if (!value || value === locale) return
    startTransition(async () => {
      await setLocale(value)
      router.refresh()
    })
  }

  return (
    <Select
      value={locale}
      onValueChange={change}
      disabled={pending}
      items={LOCALES.map((l) => ({ value: l, label: LOCALE_LABELS[l] }))}
    >
      <SelectTrigger size="sm" className="w-full" aria-label={label}>
        <LanguagesIcon className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((l) => (
          <SelectItem key={l} value={l}>
            {LOCALE_LABELS[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
