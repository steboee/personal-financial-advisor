import {
  AlertCircleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from 'lucide-react'

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
import { cn } from 'cn'
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
      icon: ArrowDownLeftIcon,
      accent: 'text-positive-foreground',
      tint: 'bg-positive-muted text-positive-foreground',
      badge: null,
      footer: c.incomeFooter,
      hint: c.incomeHint,
    },
    {
      description: c.expenses,
      value: formatCurrency(summary.expenses),
      icon: ArrowUpRightIcon,
      accent: 'text-negative-foreground',
      tint: 'bg-negative-muted text-negative-foreground',
      badge: hasIncome ? formatPercent((summary.expenses / summary.income) * 100) : null,
      badgeUp: false,
      footer: c.expensesFooter,
      hint: hasIncome ? c.expensesHint : c.noIncome,
    },
    {
      description: c.net,
      value: formatCurrency(summary.net),
      icon: WalletIcon,
      // The one figure that can go either way, so it takes its colour
      // from the value rather than from the card.
      accent: positiveNet ? 'text-positive-foreground' : 'text-negative-foreground',
      tint: positiveNet
        ? 'bg-positive-muted text-positive-foreground'
        : 'bg-negative-muted text-negative-foreground',
      badge: hasIncome ? formatPercent(summary.savingsRatePct, 1) : null,
      badgeUp: positiveNet,
      footer: positiveNet ? c.netFooterPositive : c.netFooterNegative,
      hint: hasIncome ? c.netHint : c.noIncome,
    },
    {
      description: c.uncategorized,
      value: formatCurrency(summary.uncategorized),
      icon: AlertCircleIcon,
      // Only worth flagging when there is actually something to fix.
      accent: summary.uncategorized > 0 ? 'text-wants' : undefined,
      tint:
        summary.uncategorized > 0
          ? 'bg-wants-muted text-wants'
          : 'bg-muted text-muted-foreground',
      badge: null,
      footer:
        summary.uncategorized > 0 ? c.uncategorizedFooterSome : c.uncategorizedFooterNone,
      hint:
        summary.uncategorized > 0 ? c.uncategorizedHintSome : c.uncategorizedHintNone,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.description} className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-md [&_svg]:size-3.5',
                  card.tint
                )}
              >
                <card.icon />
              </span>
              {card.description}
            </CardDescription>
            <CardTitle
              className={cn(
                'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
                card.accent
              )}
            >
              {card.value}
            </CardTitle>
            {card.badge && (
              <CardAction>
                <Badge variant="outline" className={card.tint}>
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
