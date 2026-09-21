import type { BucketType } from './buckets'

export interface CategoryStatInput {
  categoryId: string | null
  amount: number
  isIncome: boolean
  isTransfer: boolean
}

export interface CategoryStat {
  categoryId: string | null
  bucket: BucketType | null
  /** Money out, as a positive number. */
  spent: number
  count: number
  /** Share of the month's total spending, as a percentage. */
  sharePct: number
  average: number
  largest: number
  /** Same category last month; null when it did not appear then. */
  previous: number | null
  /** Change against last month, as a percentage. Null without a baseline. */
  changePct: number | null
}

interface CategoryMeta {
  id: string
  bucket: BucketType
  is_income: boolean
  is_transfer: boolean
}

/**
 * Spending per category for one month, with last month as the baseline.
 *
 * Only money out is counted. Income and transfers are excluded for the same
 * reason the 50/30/20 summary drops them: they are not spending, and mixing
 * them in would make every share meaningless.
 */
export function categoryStats(
  current: CategoryStatInput[],
  previous: CategoryStatInput[],
  categories: CategoryMeta[]
): CategoryStat[] {
  const meta = new Map(categories.map((c) => [c.id, c]))

  const spendOf = (rows: CategoryStatInput[]) => {
    const totals = new Map<string | null, { spent: number; count: number; largest: number }>()
    for (const row of rows) {
      if (row.isTransfer || row.isIncome || row.amount >= 0) continue
      const spent = Math.abs(row.amount)
      const key = row.categoryId
      const entry = totals.get(key) ?? { spent: 0, count: 0, largest: 0 }
      entry.spent += spent
      entry.count += 1
      entry.largest = Math.max(entry.largest, spent)
      totals.set(key, entry)
    }
    return totals
  }

  const now = spendOf(current)
  const before = spendOf(previous)
  const total = [...now.values()].reduce((sum, e) => sum + e.spent, 0)

  return [...now.entries()]
    .map<CategoryStat>(([categoryId, entry]) => {
      const prev = before.get(categoryId)?.spent ?? null
      return {
        categoryId,
        bucket: categoryId ? (meta.get(categoryId)?.bucket ?? null) : null,
        spent: entry.spent,
        count: entry.count,
        sharePct: total > 0 ? (entry.spent / total) * 100 : 0,
        average: entry.count > 0 ? entry.spent / entry.count : 0,
        largest: entry.largest,
        previous: prev,
        // A category that is new this month has no baseline to compare
        // against, so it reports no change rather than a misleading +100%.
        changePct: prev && prev > 0 ? ((entry.spent - prev) / prev) * 100 : null,
      }
    })
    .sort((a, b) => b.spent - a.spent)
}

export interface CategoryInsights {
  total: number
  /** Categories with spending this month. */
  active: number
  top: CategoryStat | null
  /** Biggest increase against last month, if any. */
  climbing: CategoryStat | null
  /** Biggest decrease against last month, if any. */
  falling: CategoryStat | null
  /** Share of spending held by the three largest categories. */
  concentrationPct: number
}

/** The headline figures drawn from a month's per-category breakdown. */
export function categoryInsights(stats: CategoryStat[]): CategoryInsights {
  const total = stats.reduce((sum, s) => sum + s.spent, 0)
  const compared = stats.filter((s) => s.changePct !== null)

  // A move is only worth reporting when the euro amount is material; a 300%
  // jump on a €2 category is noise, not an insight.
  const material = compared.filter((s) => Math.abs(s.spent - (s.previous ?? 0)) >= 5)
  const byChange = [...material].sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0))

  const climbing = byChange.find((s) => (s.changePct ?? 0) > 0) ?? null
  const falling = [...byChange].reverse().find((s) => (s.changePct ?? 0) < 0) ?? null

  const topThree = stats.slice(0, 3).reduce((sum, s) => sum + s.spent, 0)

  return {
    total,
    active: stats.length,
    top: stats[0] ?? null,
    climbing,
    falling,
    concentrationPct: total > 0 ? (topThree / total) * 100 : 0,
  }
}
