import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BUCKET_STYLES } from '@/lib/finance/colors'
import { formatCurrency, formatPercent } from '@/lib/finance/format'
import { cn } from 'cn'
import type { BucketSummary } from '@/lib/finance/summary'
import type { Dictionary } from '@/i18n/dictionaries'
import { t } from '@/i18n/format'

export function BucketRuleCard({
  buckets,
  income,
  dict,
}: {
  buckets: BucketSummary[]
  income: number
  dict: Dictionary
}) {
  const hasIncome = income > 0
  const r = dict.dashboard.rule

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{r.title}</CardTitle>
        <CardDescription>
          {hasIncome ? t(r.description, { income: formatCurrency(income) }) : r.noIncome}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {buckets.map((b) => {
          const over = b.overBy > 0
          const style = BUCKET_STYLES[b.bucket]
          return (
            <div key={b.bucket}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className={cn('size-2 rounded-full', style.dot)} />
                  {dict.buckets[b.bucket]}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(b.spent)}
                  {hasIncome && (
                    <>
                      {' · '}
                      <span className="text-foreground">{formatPercent(b.actualPct)}</span>
                      {' of '}
                      {formatPercent(b.targetPct)}
                    </>
                  )}
                </span>
              </div>
              <Progress
                value={hasIncome ? Math.min((b.spent / (b.targetAmount || 1)) * 100, 100) : 0}
                // The stock Progress hardcodes bg-primary on its indicator and
                // does not forward a class to it, so it is targeted by slot.
                className={cn(
                  'mt-2 [&_[data-slot=progress-indicator]]:transition-colors',
                  over ? '[&_[data-slot=progress-indicator]]:bg-negative' : style.bar
                )}
              />
              <p
                className={cn(
                  'mt-2 text-sm',
                  over ? 'text-negative-foreground' : 'text-muted-foreground'
                )}
              >
                {!hasIncome
                  ? r.importPrompt
                  : over
                    ? t(r.over, {
                        amount: formatCurrency(b.overBy),
                        target: formatCurrency(b.targetAmount),
                      })
                    : t(r.left, {
                        amount: formatCurrency(-b.overBy),
                        target: formatCurrency(b.targetAmount),
                      })}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
