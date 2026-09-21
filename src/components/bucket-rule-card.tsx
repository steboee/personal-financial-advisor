import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BUCKET_STYLES } from '@/lib/finance/colors'
import { formatCurrency, formatPercent } from '@/lib/finance/format'
import { cn } from 'cn'
import type { BucketSummary } from '@/lib/finance/summary'
import type { Dictionary } from '@/i18n/dictionaries'
import { t } from '@/i18n/format'

/**
 * Bars are scaled against a shared maximum so the three buckets can be
 * compared against each other, not just each against its own target. The
 * scale runs to at least 100% of target, and stretches when a bucket
 * overruns, so going over is visible as length rather than being clipped at
 * a full bar.
 */
function scaleMax(buckets: BucketSummary[]): number {
  const worst = Math.max(
    ...buckets.map((b) => (b.targetAmount > 0 ? b.spent / b.targetAmount : 0))
  )
  return Math.max(1, worst)
}

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
  const max = scaleMax(buckets)
  // Where the target sits on the shared scale, as a percentage of the plot
  // lane. With no overrun this is the full width.
  const targetMarkerPct = (1 / max) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>{r.title}</CardTitle>
        <CardDescription>
          {hasIncome ? t(r.description, { income: formatCurrency(income) }) : r.noIncome}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-5">
          {buckets.map((b) => {
            const over = b.overBy > 0
            const style = BUCKET_STYLES[b.bucket]
            const fillPct =
              hasIncome && b.targetAmount > 0 ? (b.spent / b.targetAmount / max) * 100 : 0

            return (
              <div key={b.bucket} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2">
                {/* Label lane */}
                <dt className="flex items-center gap-2 text-sm font-medium">
                  <span className={cn('size-2 shrink-0 rounded-full', style.dot)} aria-hidden />
                  {dict.buckets[b.bucket]}
                  <span className="text-muted-foreground font-normal">
                    {formatPercent(b.targetPct)}
                  </span>
                </dt>

                {/* Value column */}
                <dd className="font-mono text-sm tabular-nums">
                  {formatCurrency(b.spent)}
                  {hasIncome && (
                    <span className="text-muted-foreground">
                      {' / '}
                      {formatCurrency(b.targetAmount)}
                    </span>
                  )}
                </dd>

                {/* Plot lane, spanning both columns so every bar shares one
                    left edge and one scale. */}
                <div className="col-span-2">
                  <div className="bg-muted relative h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        over ? 'bg-negative' : style.barFill
                      )}
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                    {/* The target line: present only when it is not the end of
                        the scale, i.e. when some bucket has overrun. */}
                    {hasIncome && targetMarkerPct < 99.5 && (
                      <span
                        className="bg-foreground/40 absolute inset-y-0 w-px"
                        style={{ left: `${targetMarkerPct}%` }}
                        aria-hidden
                      />
                    )}
                  </div>
                  <p
                    className={cn(
                      'mt-1.5 text-sm',
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
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}
