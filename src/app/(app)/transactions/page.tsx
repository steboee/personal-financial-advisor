import Link from 'next/link'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

import { CategorySelectCell } from '@/components/category-select-cell'
import { TransactionsFilters } from '@/components/transactions-filters'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BucketType } from '@/lib/finance/buckets'
import { formatCurrency, formatDateShort } from '@/lib/finance/format'
import { getAvailableMonths, getCategories, getTransactions } from '@/lib/finance/queries'
import { getDictionary } from '@/i18n/dictionaries'
import { t } from '@/i18n/format'

export const metadata = { title: 'Transactions · Financial Advisor' }

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string
    bucket?: string
    category?: string
    search?: string
    sort?: string
    direction?: string
  }>
}) {
  const sp = await searchParams
  const sort = sp.sort === 'amount' ? 'amount' : 'date'
  const direction = sp.direction === 'asc' ? 'asc' : 'desc'

  const [transactions, categories, months, dict] = await Promise.all([
    getTransactions({
      month: sp.month,
      bucket: sp.bucket as BucketType | undefined,
      categoryId: sp.category,
      search: sp.search,
      sort,
      direction,
    }),
    getCategories(),
    getAvailableMonths(),
    getDictionary(),
  ])

  /** Builds a link that toggles the sort direction for a column. */
  function sortLink(column: 'date' | 'amount') {
    const next = new URLSearchParams(sp as Record<string, string>)
    next.set('sort', column)
    next.set('direction', sort === column && direction === 'desc' ? 'asc' : 'desc')
    return `?${next}`
  }

  const SortIcon = direction === 'desc' ? ArrowDownIcon : ArrowUpIcon

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.transactions.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t(
            transactions.length === 1
              ? dict.transactions.countOne
              : dict.transactions.countMany,
            { count: transactions.length }
          )}{' '}
          {dict.transactions.hint}
        </p>
      </div>

      <TransactionsFilters months={months} categories={categories} dict={dict} />

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">
                  <Link href={sortLink('date')} className="flex items-center gap-1">
                    {dict.transactions.columns.date}
                    {sort === 'date' && <SortIcon className="size-3.5" />}
                  </Link>
                </TableHead>
                <TableHead>{dict.transactions.columns.description}</TableHead>
                <TableHead className="w-48">{dict.transactions.columns.category}</TableHead>
                <TableHead className="w-28">{dict.transactions.columns.bucket}</TableHead>
                <TableHead className="w-32 text-right">
                  <Link href={sortLink('amount')} className="flex items-center justify-end gap-1">
                    {dict.transactions.columns.amount}
                    {sort === 'amount' && <SortIcon className="size-3.5" />}
                  </Link>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {dict.transactions.empty}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateShort(tx.booked_at)}
                    </TableCell>
                    <TableCell className="max-w-0">
                      <div className="truncate font-medium">{tx.description}</div>
                      {tx.counterparty && tx.counterparty !== tx.description && (
                        <div className="truncate text-xs text-muted-foreground">
                          {tx.counterparty}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <CategorySelectCell
                        transactionId={tx.id}
                        categoryId={tx.category_id}
                        categories={categories}
                        labels={{
                          uncategorized: dict.transactions.uncategorized,
                          ...dict.buckets,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {tx.category ? (
                        <Badge variant="outline">{dict.buckets[tx.category.bucket]}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
