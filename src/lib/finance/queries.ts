import 'server-only'

import { requireUser } from '@/lib/auth'
import type { BucketType } from '@/lib/finance/buckets'
import { monthRange } from './format'

export interface CategoryOption {
  id: string
  name: string
  bucket: BucketType
  is_income: boolean
  is_transfer: boolean
  sort_order: number
  keywords: string[] | null
}

export interface TransactionListItem {
  id: string
  booked_at: string
  amount: number
  currency: string
  description: string
  counterparty: string | null
  category_id: string | null
  tags: string[]
  bank_category: string | null
  booking_type: string | null
  category: {
    id: string
    name: string
    bucket: BucketType
    is_income: boolean
    is_transfer: boolean
  } | null
}

/** Every category for the signed-in user, in display order. */
export async function getCategories(): Promise<CategoryOption[]> {
  const { user, supabase } = await requireUser()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, bucket, is_income, is_transfer, sort_order, keywords')
    .eq('user_id', user.id)
    .order('sort_order')

  if (error) throw new Error(`Could not load categories: ${error.message}`)
  return (data ?? []) as CategoryOption[]
}

/** Money direction: what came in, what went out, or everything. */
export type DirectionFilter = 'in' | 'out'

export interface TransactionFilters {
  month?: string
  from?: string
  to?: string
  categoryId?: string
  bucket?: BucketType
  search?: string
  /** 'in' keeps credits, 'out' keeps debits. */
  flow?: DirectionFilter
  /** Bounds on the absolute amount, so they read the same for in and out. */
  minAmount?: number
  maxAmount?: number
  /** Only rows with no category yet. */
  uncategorized?: boolean
  sort?: 'date' | 'amount'
  direction?: 'asc' | 'desc'
  limit?: number
}

/**
 * Transactions with their category joined. RLS already scopes rows to the
 * signed-in user; the explicit user_id filter keeps the index in play.
 */
export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionListItem[]> {
  const { user, supabase } = await requireUser()

  let query = supabase
    .from('transactions')
    .select(
      'id, booked_at, amount, currency, description, counterparty, category_id, tags, bank_category, booking_type, category:categories(id, name, bucket, is_income, is_transfer)'
    )
    .eq('user_id', user.id)

  if (filters.month) {
    const { from, to } = monthRange(filters.month)
    query = query.gte('booked_at', from).lte('booked_at', to)
  }
  if (filters.from) query = query.gte('booked_at', filters.from)
  if (filters.to) query = query.lte('booked_at', filters.to)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.uncategorized) query = query.is('category_id', null)

  // Amount filters run in SQL. Bounds are on the absolute value, so
  // "at least 50" means the same thing for income and for spending.
  if (filters.flow === 'in') query = query.gt('amount', 0)
  if (filters.flow === 'out') query = query.lt('amount', 0)

  if (filters.minAmount != null) {
    if (filters.flow === 'in') query = query.gte('amount', filters.minAmount)
    else if (filters.flow === 'out') query = query.lte('amount', -filters.minAmount)
    else query = query.or(`amount.gte.${filters.minAmount},amount.lte.${-filters.minAmount}`)
  }
  if (filters.maxAmount != null) {
    if (filters.flow === 'in') query = query.lte('amount', filters.maxAmount)
    else if (filters.flow === 'out') query = query.gte('amount', -filters.maxAmount)
    // |amount| <= max is just -max <= amount <= max, so two plain bounds.
    else query = query.lte('amount', filters.maxAmount).gte('amount', -filters.maxAmount)
  }
  if (filters.search) {
    const term = filters.search.replace(/[%,]/g, ' ').trim()
    if (term) query = query.or(`description.ilike.%${term}%,counterparty.ilike.%${term}%`)
  }

  const sortColumn = filters.sort === 'amount' ? 'amount' : 'booked_at'
  query = query
    .order(sortColumn, { ascending: filters.direction === 'asc' })
    .limit(filters.limit ?? 500)

  const { data, error } = await query
  if (error) throw new Error(`Could not load transactions: ${error.message}`)

  const rows = (data ?? []) as unknown as TransactionListItem[]

  // Bucket is a property of the joined category, so it is filtered here
  // rather than in SQL.
  return filters.bucket ? rows.filter((r) => r.category?.bucket === filters.bucket) : rows
}

/** Months that actually have data, newest first, as `YYYY-MM` keys. */
export async function getAvailableMonths(): Promise<string[]> {
  const { user, supabase } = await requireUser()

  const { data, error } = await supabase
    .from('transactions')
    .select('booked_at')
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })
    .limit(2000)

  if (error) throw new Error(`Could not load months: ${error.message}`)

  const months = new Set<string>()
  for (const row of (data ?? []) as { booked_at: string }[]) {
    months.add(row.booked_at.slice(0, 7))
  }
  return [...months]
}

export interface DataStats {
  transactions: number
  categories: number
  months: number
  oldest: string | null
  newest: string | null
}

/** Counts for the settings page. Uses head-only queries so no rows travel. */
export async function getDataStats(): Promise<DataStats> {
  const { user, supabase } = await requireUser()

  const [tx, cat, oldest, newest, months] = await Promise.all([
    supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('transactions')
      .select('booked_at')
      .eq('user_id', user.id)
      .order('booked_at', { ascending: true })
      .limit(1),
    supabase
      .from('transactions')
      .select('booked_at')
      .eq('user_id', user.id)
      .order('booked_at', { ascending: false })
      .limit(1),
    getAvailableMonths(),
  ])

  return {
    transactions: tx.count ?? 0,
    categories: cat.count ?? 0,
    months: months.length,
    oldest: (oldest.data?.[0] as { booked_at: string } | undefined)?.booked_at ?? null,
    newest: (newest.data?.[0] as { booked_at: string } | undefined)?.booked_at ?? null,
  }
}
