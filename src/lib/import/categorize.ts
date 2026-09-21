import { normalizeForHash } from './hash'
import type { ParsedTransaction } from './slsp'

interface MatchableCategory {
  id: string
  name: string
  keywords: string[]
  isIncome: boolean
  isTransfer: boolean
}

/**
 * Assigns a category by keyword match.
 *
 * Searchable text combines the description, the counterparty, the booking
 * type and the bank's own category — the last is the strongest signal, since
 * George has already classified the transaction (e.g. "Potraviny").
 *
 * Matching is diacritic-insensitive: a keyword of "restaur" must match
 * "Reštaurácia". Categories are tried in `sortOrder`, so the caller controls
 * precedence and the first hit wins.
 */
export function categorize(
  transaction: ParsedTransaction,
  categories: MatchableCategory[]
): string | null {
  const haystack = normalizeForHash(
    [
      transaction.bankCategory,
      transaction.description,
      transaction.counterparty,
      transaction.bookingType,
    ]
      .filter(Boolean)
      .join(' ')
  )

  if (!haystack) return null

  // Incoming money goes to the income category unless a transfer matches
  // first — transfers between own accounts are also positive on one side.
  const isCredit = transaction.amount > 0

  for (const category of categories) {
    for (const keyword of category.keywords) {
      const needle = normalizeForHash(keyword)
      if (needle && haystack.includes(needle)) {
        // Don't file a credit under an expense category, or a debit under
        // income: a "Potraviny" refund is not groceries spending.
        if (isCredit && !category.isIncome && !category.isTransfer) continue
        if (!isCredit && category.isIncome) continue
        return category.id
      }
    }
  }

  // Unmatched credits still belong in income.
  if (isCredit) {
    const income = categories.find((c) => c.isIncome)
    if (income) return income.id
  }

  return null
}
