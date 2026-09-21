import { AlertCircleIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatPercent, formatSigned } from '@/lib/finance/format'
import { cn } from 'cn'
import type { MonthSummary } from '@/lib/finance/summary'
import type { Dictionary } from '@/i18n/dictionaries'

/**
 * A stat, not a card: label, figure, and the qualifier that makes the figure
 * mean something. Figures are mono and tabular so they align down the strip.
 */
function Stat({
  label,
  value,
  detail,
  emphasis = 'normal',
  tone,
}: {
  label: string
  value: string
  detail: string
  emphasis?: 'normal' | 'lead'
  tone?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <span
        className={cn(
          'font-mono tabular-nums tracking-tight',
          emphasis === 'lead' ? 'text-3xl font-semibold' : 'text-2xl font-normal',
          tone
        )}
      >
        {value}
      </span>
      <span className="text-muted-foreground text-sm">{detail}</span>
    </div>
  )
}

export function SectionCards({ summary, dict }: { summary: MonthSummary; dict: Dictionary }) {
  const c = dict.dashboard.cards
  const hasIncome = summary.income > 0
  const positiveNet = summary.net >= 0
  const needsAttention = summary.uncategorized > 0

  return (
    <div className="grid gap-4 px-4 lg:px-6 @3xl/main:grid-cols-3">
      {/*
        Income and expenses are one relationship, not two peer metrics: they
        are the two sides that resolve into net, so they share a card and the
        comparison is legible without reading two separate boxes.
      */}
      <Card className="@3xl/main:col-span-2">
        <CardContent className="grid gap-6 @xl/card:grid-cols-3">
          <Stat label={c.income} value={formatCurrency(summary.income)} detail={c.incomeFooter} />
          <Stat
            label={c.expenses}
            value={formatCurrency(summary.expenses)}
            detail={
              hasIncome
                ? `${formatPercent((summary.expenses / summary.income) * 100)} ${c.expensesHint.toLowerCase()}`
                : c.noIncome
            }
          />
          {/*
            The one figure that can go either way, so it is the only one that
            takes colour — and the sign carries the same meaning for readers
            who cannot see it.
          */}
          <Stat
            label={c.net}
            value={formatSigned(summary.net)}
            detail={
              !hasIncome
                ? c.noIncome
                : positiveNet
                  ? `${formatPercent(summary.savingsRatePct, 1)} · ${c.netHint.toLowerCase()}`
                  : c.netFooterNegative
            }
            emphasis="lead"
            tone={positiveNet ? 'text-positive-foreground' : 'text-negative-foreground'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex h-full flex-col justify-center gap-1">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
            {/* Icon is redundant with the text, never the only signal. */}
            {needsAttention && <AlertCircleIcon className="text-wants-foreground size-4" />}
            {c.uncategorized}
          </span>
          <span
            className={cn(
              'font-mono text-2xl tracking-tight tabular-nums',
              needsAttention ? 'text-wants-foreground' : 'text-muted-foreground'
            )}
          >
            {formatCurrency(summary.uncategorized)}
          </span>
          <span className="text-muted-foreground text-sm">
            {needsAttention ? c.uncategorizedHintSome : c.uncategorizedHintNone}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
