import { createHash } from 'node:crypto'

/**
 * Stable fingerprint for a transaction.
 *
 * SLSP exports carry no usable transaction id (`transactionId` is null on
 * every record in the sample), so identity has to come from the content:
 * date + amount + normalized description, scoped to the user.
 *
 * The description is normalized so that trivial formatting differences
 * between two exports of the same period do not produce two different
 * hashes — otherwise re-importing an overlapping range would duplicate rows.
 */
export function normalizeForHash(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics: Reštaurácia -> Restauracia
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function transactionHash(input: {
  userId: string
  bookedAt: string
  amount: number
  description: string
}): string {
  const parts = [
    input.userId,
    input.bookedAt,
    // Fixed precision: 10 and 10.00 must hash identically.
    input.amount.toFixed(2),
    normalizeForHash(input.description),
  ]
  return createHash('sha256').update(parts.join('|')).digest('hex')
}
