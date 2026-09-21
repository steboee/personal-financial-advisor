'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/lib/auth'
import { categorize } from '@/lib/import/categorize'
import { transactionHash } from '@/lib/import/hash'
import { parseSlspFile } from '@/lib/import/slsp'
import { getDictionary, type Dictionary } from '@/i18n/dictionaries'
import { t } from '@/i18n/format'

/** The category shape these actions select. */
interface CategoryRow {
  id: string
  name: string
  keywords: string[] | null
  is_income: boolean
  is_transfer: boolean
}

export interface ImportResult {
  ok: boolean
  imported: number
  skipped: number
  failed: number
  message: string
  errors?: string[]
}

const MAX_BYTES = 10 * 1024 * 1024

export async function importTransactions(formData: FormData): Promise<ImportResult> {
  // Re-check auth here: Server Actions are POSTs to an existing route and
  // must never rely on the proxy alone.
  const { user, supabase } = await requireUser()
  const dict = await getDictionary()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, imported: 0, skipped: 0, failed: 0, message: dict.import.errors.noFile }
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      imported: 0,
      skipped: 0,
      failed: 0,
      message: dict.import.errors.tooLarge,
    }
  }

  const { transactions, errors } = parseSlspFile(file.name, await file.text())

  if (transactions.length === 0) {
    return {
      ok: false,
      imported: 0,
      skipped: 0,
      failed: errors.length,
      message: errors[0]?.reason ?? dict.import.errors.unreadable,
    }
  }

  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, keywords, is_income, is_transfer')
    .eq('user_id', user.id)
    .order('sort_order')

  if (categoryError) {
    return {
      ok: false,
      imported: 0,
      skipped: 0,
      failed: 0,
      message: `Could not load categories: ${categoryError.message}`,
    }
  }

  const matchable = ((categories ?? []) as CategoryRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    keywords: c.keywords ?? [],
    isIncome: c.is_income,
    isTransfer: c.is_transfer,
  }))

  // Build rows, de-duplicating within the file itself first — a single
  // export can legitimately repeat an identical transaction, and one insert
  // batch cannot contain the same unique key twice.
  const seen = new Set<string>()
  const rows = []
  let duplicatesInFile = 0

  for (const t of transactions) {
    const hash = transactionHash({
      userId: user.id,
      bookedAt: t.bookedAt,
      amount: t.amount,
      description: t.description,
    })
    if (seen.has(hash)) {
      duplicatesInFile++
      continue
    }
    seen.add(hash)

    rows.push({
      user_id: user.id,
      booked_at: t.bookedAt,
      amount: t.amount,
      currency: t.currency,
      description: t.description,
      counterparty: t.counterparty,
      category_id: categorize(t, matchable),
      bank_category: t.bankCategory,
      booking_type: t.bookingType,
      variable_symbol: t.variableSymbol,
      counterparty_iban: t.counterpartyIban,
      raw: t.raw,
      transaction_hash: hash,
      source: 'slsp',
    })
  }

  // ignoreDuplicates makes the unique (user_id, transaction_hash) constraint
  // skip rows already present, so overlapping date ranges are safe to
  // re-import. The returned rows are exactly the ones inserted.
  const { data: inserted, error: insertError } = await supabase
    .from('transactions')
    // @ts-expect-error — the generated Insert type is stricter than the payload
    .upsert(rows, { onConflict: 'user_id,transaction_hash', ignoreDuplicates: true })
    .select('id')

  if (insertError) {
    return {
      ok: false,
      imported: 0,
      skipped: 0,
      failed: rows.length,
      message: `Import failed: ${insertError.message}`,
    }
  }

  const imported = inserted?.length ?? 0
  const skipped = transactions.length - imported

  return {
    ok: true,
    imported,
    skipped,
    failed: errors.length,
    message: buildMessage(dict, imported, skipped, errors.length, duplicatesInFile),
    errors: errors.slice(0, 5).map((e) => `Row ${e.row}: ${e.reason}`),
  }
}

function buildMessage(
  dict: Dictionary,
  imported: number,
  skipped: number,
  failed: number,
  duplicatesInFile: number
): string {
  const r = dict.import.result
  const parts: string[] = []

  parts.push(
    imported === 0
      ? r.importedNone
      : imported === 1
        ? r.importedOne
        : t(r.importedMany, { count: imported })
  )

  if (skipped > 0) {
    parts.push(skipped === 1 ? r.skippedOne : t(r.skippedMany, { count: skipped }))
  }
  if (duplicatesInFile > 0) {
    parts.push(
      duplicatesInFile === 1 ? r.repeatedOne : t(r.repeatedMany, { count: duplicatesInFile })
    )
  }
  if (failed > 0) {
    parts.push(failed === 1 ? r.failedOne : t(r.failedMany, { count: failed }))
  }

  return parts.join(' ')
}

/** Re-runs auto-categorization over transactions that have no category. */
export async function recategorizeUncategorized(): Promise<{ updated: number; message: string }> {
  const { user, supabase } = await requireUser()

  const [{ data: categories }, { data: pending }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, keywords, is_income, is_transfer')
      .eq('user_id', user.id)
      .order('sort_order'),
    supabase
      .from('transactions')
      .select('id, description, counterparty, booking_type, bank_category, amount')
      .eq('user_id', user.id)
      .is('category_id', null)
      .limit(1000),
  ])

  const matchable = ((categories ?? []) as CategoryRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    keywords: c.keywords ?? [],
    isIncome: c.is_income,
    isTransfer: c.is_transfer,
  }))

  let updated = 0
  for (const row of (pending ?? []) as {
    id: string
    description: string | null
    counterparty: string | null
    booking_type: string | null
    bank_category: string | null
    amount: number
  }[]) {
    const categoryId = categorize(
      {
        bookedAt: '',
        amount: row.amount,
        currency: 'EUR',
        description: row.description ?? '',
        counterparty: row.counterparty,
        bookingType: row.booking_type,
        bankCategory: row.bank_category,
        variableSymbol: null,
        counterpartyIban: null,
        raw: null,
      },
      matchable
    )
    if (!categoryId) continue

    const { error } = await supabase
      .from('transactions')
      .update({ category_id: categoryId })
      .eq('id', row.id)
    if (!error) updated++
  }

  revalidatePath('/transactions')
  revalidatePath('/')

  return {
    updated,
    message:
      updated === 0
        ? 'No uncategorized transactions matched a category.'
        : `Categorized ${updated} ${updated === 1 ? 'transaction' : 'transactions'}.`,
  }
}
