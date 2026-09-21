import {
  LayersIcon,
  PieChartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from 'lucide-react'

import { CategoryManager } from '@/components/category-manager'
import { MonthSelect } from '@/components/month-select'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BUCKET_STYLES } from '@/lib/finance/colors'
import { formatCurrency, formatMonth, formatPercent, monthKey } from '@/lib/finance/format'
import { getAvailableMonths, getCategories, getTransactions } from '@/lib/finance/queries'
import { categoryInsights, categoryStats } from '@/lib/finance/category-stats'
import { categoryName } from '@/i18n/categories'
import { getDictionary } from '@/i18n/dictionaries'
import { t } from '@/i18n/format'
import { cn } from 'cn'

export const metadata = { title: 'Categories · Financial Advisor' }

/** The calendar month before `key`, as a `YYYY-MM` key. */
function previousMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return monthKey(new Date(y, m - 2, 1))
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const months = await getAvailableMonths()
  // Default to the newest month that actually has data, so the page is never
  // empty just because the current calendar month has no transactions yet.
  const current = month ?? months[0] ?? monthKey(new Date())

  const [transactions, priorTransactions, categories, dict] = await Promise.all([
    getTransactions({ month: current, limit: 2000 }),
    getTransactions({ month: previousMonth(current), limit: 2000 }),
    getCategories(),
    getDictionary(),
  ])

  const c = dict.categories
  const names = Object.fromEntries(categories.map((cat) => [cat.id, categoryName(dict, cat.name)]))

  const toInput = (rows: typeof transactions) =>
    rows.map((tx) => ({
      categoryId: tx.category_id,
      amount: tx.amount,
      isIncome: tx.category?.is_income ?? false,
      isTransfer: tx.category?.is_transfer ?? false,
    }))

  const stats = categoryStats(toInput(transactions), toInput(priorTransactions), categories)
  const insights = categoryInsights(stats)

  const usage = transactions.reduce<Record<string, number>>((acc, tx) => {
    if (tx.category_id) acc[tx.category_id] = (acc[tx.category_id] ?? 0) + 1
    return acc
  }, {})

  const nameOf = (stat: { categoryId: string | null }) =>
    stat.categoryId ? (names[stat.categoryId] ?? '—') : c.breakdown.uncategorized

  const monthLabel = formatMonth(new Date(`${current}-01T00:00:00`))

  const cards = [
    {
      key: 'total',
      label: c.insights.total,
      value: formatCurrency(insights.total),
      footer: t(c.insights.totalFooter, { count: insights.active }),
      icon: WalletIcon,
      tint: 'bg-muted text-foreground',
    },
    {
      key: 'top',
      label: c.insights.top,
      value: insights.top ? nameOf(insights.top) : '—',
      footer: insights.top
        ? t(c.insights.topFooter, { share: formatPercent(insights.top.sharePct) })
        : c.insights.noneYet,
      icon: PieChartIcon,
      tint: 'bg-muted text-foreground',
    },
    {
      key: 'climbing',
      label: c.insights.climbing,
      value: insights.climbing ? nameOf(insights.climbing) : '—',
      footer: insights.climbing
        ? t(c.insights.climbingFooter, {
            amount: formatCurrency(
              insights.climbing.spent - (insights.climbing.previous ?? 0)
            ),
          })
        : c.insights.noComparison,
      icon: TrendingUpIcon,
      tint: 'bg-negative-muted text-negative-foreground',
    },
    {
      key: 'falling',
      label: c.insights.falling,
      value: insights.falling ? nameOf(insights.falling) : '—',
      footer: insights.falling
        ? t(c.insights.fallingFooter, {
            amount: formatCurrency((insights.falling.previous ?? 0) - insights.falling.spent),
          })
        : c.insights.noComparison,
      icon: TrendingDownIcon,
      tint: 'bg-positive-muted text-positive-foreground',
    },
    {
      key: 'concentration',
      label: c.insights.concentration,
      value: formatPercent(insights.concentrationPct),
      footer: c.insights.concentrationFooter,
      icon: LayersIcon,
      tint: 'bg-muted text-foreground',
    },
  ]

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t(c.subtitle, { month: monthLabel })}
          </p>
        </div>
        {months.length > 0 && <MonthSelect months={months} value={current} />}
      </div>

      {stats.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{c.empty}</CardTitle>
            <CardDescription>{c.emptyHint}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.key}>
                <CardHeader>
                  <CardDescription className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-md',
                        card.tint
                      )}
                    >
                      <card.icon className="size-3.5" />
                    </span>
                    {card.label}
                  </CardDescription>
                  <CardTitle className="truncate text-xl tabular-nums">{card.value}</CardTitle>
                </CardHeader>
                <CardContent className="-mt-2 text-sm text-muted-foreground">
                  {card.footer}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{c.breakdown.title}</CardTitle>
              <CardDescription>{c.breakdown.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{c.breakdown.columns.category}</TableHead>
                    <TableHead className="w-28">{c.breakdown.columns.bucket}</TableHead>
                    <TableHead className="w-44">{c.breakdown.columns.share}</TableHead>
                    <TableHead className="w-28 text-right">
                      {c.breakdown.columns.count}
                    </TableHead>
                    <TableHead className="w-28 text-right">
                      {c.breakdown.columns.average}
                    </TableHead>
                    <TableHead className="w-32 text-right">
                      {c.breakdown.columns.change}
                    </TableHead>
                    <TableHead className="w-32 text-right">
                      {c.breakdown.columns.spent}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((stat) => {
                    const up = (stat.changePct ?? 0) > 0
                    return (
                      <TableRow key={stat.categoryId ?? 'uncategorized'}>
                        <TableCell className="font-medium">{nameOf(stat)}</TableCell>
                        <TableCell>
                          {stat.bucket ? (
                            <Badge
                              variant="outline"
                              className={BUCKET_STYLES[stat.bucket].badge}
                            >
                              {dict.buckets[stat.bucket]}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={stat.sharePct}
                              className={cn(
                                'h-1.5 flex-1',
                                stat.bucket && BUCKET_STYLES[stat.bucket].bar
                              )}
                            />
                            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                              {formatPercent(stat.sharePct)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {stat.count}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatCurrency(stat.average)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {stat.changePct === null ? (
                            <span className="text-xs text-muted-foreground">
                              {c.breakdown.new}
                            </span>
                          ) : (
                            <span
                              className={
                                up ? 'text-negative-foreground' : 'text-positive-foreground'
                              }
                            >
                              {up ? '+' : '−'}
                              {formatPercent(Math.abs(stat.changePct))}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(stat.spent)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{c.manage.title}</CardTitle>
          <CardDescription>{c.manage.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <CategoryManager
            categories={categories}
            names={names}
            usage={usage}
            dict={dict}
          />
        </CardContent>
      </Card>
    </div>
  )
}
