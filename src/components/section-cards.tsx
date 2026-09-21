import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/finance/format'
import type { MonthSummary } from '@/lib/finance/summary'
import type { Dictionary } from '@/i18n/dictionaries'

export function SectionCards({ summary, dict }: { summary: MonthSummary; dict: Dictionary }) {
  const c = dict.dashboard.cards
  const hasIncome = summary.income > 0
  const positiveNet = summary.net >= 0

  const cards = [
    {
      description: c.income,
      value: formatCurrency(summary.income),
      badge: null,
      footer: c.incomeFooter,
      hint: c.incomeHint,
    },
    {
      description: c.expenses,
      value: formatCurrency(summary.expenses),
      badge: hasIncome ? formatPercent((summary.expenses / summary.income) * 100) : null,
      badgeUp: false,
      footer: c.expensesFooter,
      hint: hasIncome ? c.expensesHint : c.noIncome,
    },
    {
      description: c.net,
      value: formatCurrency(summary.net),
      badge: hasIncome ? formatPercent(summary.savingsRatePct, 1) : null,
      badgeUp: positiveNet,
      footer: positiveNet ? c.netFooterPositive : c.netFooterNegative,
      hint: hasIncome ? c.netHint : c.noIncome,
    },
    {
      description: c.uncategorized,
      value: formatCurrency(summary.uncategorized),
      badge: null,
      footer:
        summary.uncategorized > 0 ? c.uncategorizedFooterSome : c.uncategorizedFooterNone,
      hint:
        summary.uncategorized > 0 ? c.uncategorizedHintSome : c.uncategorizedHintNone,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.description} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            {card.badge && (
              <CardAction>
                <Badge variant="outline">
                  {card.badgeUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {card.badge}
                </Badge>
              </CardAction>
            )}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{card.footer}</div>
            <div className="text-muted-foreground">{card.hint}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
