export const LOCALES = ['sk', 'en'] as const
export type Locale = (typeof LOCALES)[number]

/** Slovak is the default: the app is built around Slovak bank exports. */
export const DEFAULT_LOCALE: Locale = 'sk'

export const LOCALE_COOKIE = 'locale'

export const LOCALE_LABELS: Record<Locale, string> = {
  sk: 'Slovenčina',
  en: 'English',
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}
