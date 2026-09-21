import 'server-only'

import { cookies, headers } from 'next/headers'

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES, type Locale } from './config'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  sk: () => import('./dictionaries/sk.json').then((m) => m.default),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['en']>>

/**
 * Resolves the locale for this request: an explicit cookie wins, otherwise
 * the browser's Accept-Language header, otherwise the default.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value
  if (isLocale(fromCookie)) return fromCookie

  const accept = (await headers()).get('accept-language') ?? ''
  for (const part of accept.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase()
    const base = tag?.split('-')[0]
    if (isLocale(base)) return base
  }

  return DEFAULT_LOCALE
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())]()
}

export { LOCALES, type Locale }
