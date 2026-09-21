import Papa from 'papaparse'

/**
 * Parser for Slovenská sporiteľňa (George) exports.
 *
 * Handles both the JSON export and the CSV export. The JSON form is the
 * richer one and is preferred; see docs/fixtures/slsp-sample.json for a
 * scrubbed record of every booking type this has been checked against.
 */

export interface ParsedTransaction {
  /** ISO date, `YYYY-MM-DD`. */
  bookedAt: string
  /** Signed: negative is money out. */
  amount: number
  currency: string
  description: string
  counterparty: string | null
  bookingType: string | null
  /** The bank's own category, kept as a categorization hint. */
  bankCategory: string | null
  variableSymbol: string | null
  counterpartyIban: string | null
  raw: unknown
}

export interface ParseResult {
  transactions: ParsedTransaction[]
  /** Rows that could not be read, with the reason. */
  errors: { row: number; reason: string }[]
}

/** SLSP amounts arrive as minor units plus a precision: -1000 @ 2 → -10.00. */
function toDecimal(value: number, precision: number | null | undefined): number {
  const p = typeof precision === 'number' ? precision : 2
  return value / 10 ** p
}

/** `2026-09-20T00:00:00.000+0200` → `2026-09-20`, without timezone drift. */
function toIsoDate(value: string): string | null {
  const direct = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  if (direct) return direct[1]

  // CSV exports use D.M.YYYY or DD.MM.YYYY.
  const dotted = /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})/.exec(value.trim())
  if (dotted) {
    const [, d, m, y] = dotted
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().replace(/\s+/g, ' ')
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Builds the human-readable description. SLSP spreads the useful text across
 * several optional fields, so this picks the most specific one available and
 * falls back to the booking type.
 */
function buildDescription(record: Record<string, unknown>): string {
  const candidates = [
    cleanText(record.partnerName),
    cleanText(record.reference),
    cleanText(record.receiverReference),
    cleanText(record.senderReference),
    cleanText(record.note),
    cleanText(record.cardLocation),
    cleanText(record.bookingTypeTranslation),
  ].filter((v): v is string => v !== null)

  return candidates[0] ?? 'Unknown transaction'
}

interface SlspAmount {
  value?: number
  precision?: number
  currency?: string
}

interface SlspRecord {
  booking?: string
  valuation?: string
  amount?: SlspAmount
  partnerName?: string
  partnerAccount?: { iban?: string | null }
  categories?: string[]
  variableSymbol?: string
  bookingTypeTranslation?: string
  [key: string]: unknown
}

/** Parses the George JSON export: a top-level array of transaction records. */
export function parseSlspJson(text: string): ParseResult {
  const transactions: ParsedTransaction[] = []
  const errors: ParseResult['errors'] = []

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { transactions, errors: [{ row: 0, reason: 'The file is not valid JSON.' }] }
  }

  // Tolerate a wrapper object around the array.
  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { transactions?: unknown[] })?.transactions)
      ? (data as { transactions: unknown[] }).transactions
      : []

  if (rows.length === 0) {
    return { transactions, errors: [{ row: 0, reason: 'No transactions found in the file.' }] }
  }

  rows.forEach((row, index) => {
    const record = row as SlspRecord

    const rawDate = record.booking ?? record.valuation
    const bookedAt = typeof rawDate === 'string' ? toIsoDate(rawDate) : null
    if (!bookedAt) {
      errors.push({ row: index + 1, reason: 'Missing or unreadable booking date.' })
      return
    }

    const amountValue = record.amount?.value
    if (typeof amountValue !== 'number') {
      errors.push({ row: index + 1, reason: 'Missing amount.' })
      return
    }

    transactions.push({
      bookedAt,
      amount: toDecimal(amountValue, record.amount?.precision),
      currency: record.amount?.currency ?? 'EUR',
      description: buildDescription(record),
      counterparty: cleanText(record.partnerName),
      bookingType: cleanText(record.bookingTypeTranslation),
      bankCategory: Array.isArray(record.categories) ? (cleanText(record.categories[0]) ?? null) : null,
      variableSymbol: cleanText(record.variableSymbol),
      counterpartyIban: cleanText(record.partnerAccount?.iban),
      raw: row,
    })
  })

  return { transactions, errors }
}

/** Column aliases seen across SLSP CSV exports, lowercased. */
const CSV_FIELDS = {
  date: ['dátum zaúčtovania', 'datum zauctovania', 'dátum', 'datum', 'booking date', 'date'],
  amount: ['suma', 'čiastka', 'ciastka', 'amount'],
  currency: ['mena', 'currency'],
  partner: ['názov partnera', 'nazov partnera', 'partner', 'príjemca', 'prijemca'],
  reference: ['poznámka', 'poznamka', 'správa pre prijímateľa', 'sprava pre prijimatela', 'popis', 'reference'],
  iban: ['iban partnera', 'účet partnera', 'ucet partnera', 'iban'],
  vs: ['variabilný symbol', 'variabilny symbol', 'vs'],
  type: ['typ transakcie', 'typ', 'type'],
  category: ['kategória', 'kategoria', 'category'],
} as const

function pick(row: Record<string, string>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const match = Object.keys(row).find((k) => k.trim().toLowerCase() === key)
    if (match) {
      const value = cleanText(row[match])
      if (value) return value
    }
  }
  return null
}

/** SLSP CSV uses a comma decimal separator and spaces as thousands separators. */
function parseCsvAmount(value: string): number | null {
  const normalized = value
    .replace(/\s| /g, '')
    .replace(/\.(?=\d{3}\b)/g, '')
    .replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseSlspCsv(text: string): ParseResult {
  const transactions: ParsedTransaction[] = []
  const errors: ParseResult['errors'] = []

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: '', // auto-detect; SLSP uses ';' in some exports
    transformHeader: (h) => h.trim(),
  })

  result.data.forEach((row, index) => {
    const rawDate = pick(row, CSV_FIELDS.date)
    const bookedAt = rawDate ? toIsoDate(rawDate) : null
    if (!bookedAt) {
      errors.push({ row: index + 2, reason: 'Missing or unreadable date.' })
      return
    }

    const rawAmount = pick(row, CSV_FIELDS.amount)
    const amount = rawAmount ? parseCsvAmount(rawAmount) : null
    if (amount === null) {
      errors.push({ row: index + 2, reason: 'Missing or unreadable amount.' })
      return
    }

    const partner = pick(row, CSV_FIELDS.partner)
    const reference = pick(row, CSV_FIELDS.reference)

    transactions.push({
      bookedAt,
      amount,
      currency: pick(row, CSV_FIELDS.currency) ?? 'EUR',
      description: partner ?? reference ?? 'Unknown transaction',
      counterparty: partner,
      bookingType: pick(row, CSV_FIELDS.type),
      bankCategory: pick(row, CSV_FIELDS.category),
      variableSymbol: pick(row, CSV_FIELDS.vs),
      counterpartyIban: pick(row, CSV_FIELDS.iban),
      raw: row,
    })
  })

  return { transactions, errors }
}

/** Dispatches on file type. */
export function parseSlspFile(filename: string, text: string): ParseResult {
  return filename.toLowerCase().endsWith('.json') ? parseSlspJson(text) : parseSlspCsv(text)
}
