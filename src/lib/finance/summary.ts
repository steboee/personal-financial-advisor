import type { BucketType } from './buckets'
import { BUCKET_ORDER, BUCKET_TARGETS } from './buckets'

export interface SummaryInput {
  amount: number
  bucket: BucketType | null
  isIncome: boolean
  isTransfer: boolean
}

export interface BucketSummary {
  bucket: BucketType
  spent: number
  /** Share of income, as a percentage. Zero when there is no income. */
  actualPct: number
  targetPct: number
  /** Euro amount the target allows. */
  targetAmount: number
  /** Positive when over target. */
  overBy: number
}

export interface MonthSummary {
  income: number
  expenses: number
  net: number
  /** Share of income kept, as a percentage. */
  savingsRatePct: number
  buckets: BucketSummary[]
  uncategorized: number
}

/**
 * Aggregates a month's transactions into the 50/30/20 view.
 *
 * Transfers between the user's own accounts are excluded entirely: moving
 * money between accounts is neither income nor expense, and counting it would
 * inflate both sides.
 */
export function summarize(transactions: SummaryInput[]): MonthSummary {
  let income = 0
  let expenses = 0
  let uncategorized = 0
  const spentPerBucket: Record<BucketType, number> = { needs: 0, wants: 0, savings: 0 }

  for (const t of transactions) {
    if (t.isTransfer) continue

    if (t.isIncome || t.amount > 0) {
      income += Math.abs(t.amount)
      continue
    }

    const spent = Math.abs(t.amount)
    expenses += spent

    if (t.bucket) {
      spentPerBucket[t.bucket] += spent
    } else {
      uncategorized += spent
    }
  }

  const buckets = BUCKET_ORDER.map<BucketSummary>((bucket) => {
    const spent = spentPerBucket[bucket]
    const targetPct = BUCKET_TARGETS[bucket]
    const targetAmount = (income * targetPct) / 100
    return {
      bucket,
      spent,
      actualPct: income > 0 ? (spent / income) * 100 : 0,
      targetPct,
      targetAmount,
      overBy: spent - targetAmount,
    }
  })

  const net = income - expenses

  return {
    income,
    expenses,
    net,
    savingsRatePct: income > 0 ? (net / income) * 100 : 0,
    buckets,
    uncategorized,
  }
}
