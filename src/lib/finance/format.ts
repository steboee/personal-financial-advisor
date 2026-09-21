const LOCALE = 'sk-SK'

const currencyFull = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const currencyRounded = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/** Money, always with both decimals. Use in tables and totals. */
export function formatCurrency(amount: number): string {
  return currencyFull.format(amount)
}

/** Money without decimals, for headline figures where cents add noise. */
export function formatCurrencyRounded(amount: number): string {
  return currencyRounded.format(amount)
}

/**
 * A signed amount for display: an explicit sign makes the direction legible
 * without relying on colour.
 */
export function formatSigned(amount: number): string {
  const sign = amount < 0 ? '−' : '+'
  return `${sign}${currencyFull.format(Math.abs(amount))}`
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`
}

const dateShort = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const dateLong = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })
const monthLong = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

/** Parses a `date` column ("2026-09-20") without shifting across timezones. */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function formatDateShort(value: string): string {
  return dateShort.format(parseDateOnly(value))
}

export function formatDateLong(value: string): string {
  return dateLong.format(parseDateOnly(value))
}

export function formatMonth(date: Date): string {
  return monthLong.format(date)
}

/** "2026-09" — the month key used for filtering. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** First and last day of a month, as `date` column strings. */
export function monthRange(key: string): { from: string; to: string } {
  const [y, m] = key.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return {
    from: `${key}-01`,
    to: `${key}-${String(last).padStart(2, '0')}`,
  }
}
