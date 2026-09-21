/**
 * Right-hand dark tile. Static illustrative figures — this renders before
 * anyone is signed in, so it must never touch real data.
 */

const BUCKETS = [
  { label: 'Needs', target: 50, actual: 44, bar: 'bg-needs' },
  { label: 'Wants', target: 30, actual: 33, bar: 'bg-wants' },
  { label: 'Savings', target: 20, actual: 23, bar: 'bg-savings' },
]

const TRANSACTIONS = [
  { merchant: 'Lidl', category: 'Groceries', bucket: 'Needs', amount: -24.8, dot: 'bg-needs' },
  { merchant: 'Reštaurácia', category: 'Dining out', bucket: 'Wants', amount: -18.5, dot: 'bg-wants' },
  { merchant: 'Slovnaft', category: 'Transport', bucket: 'Needs', amount: -52.0, dot: 'bg-needs' },
  { merchant: 'ETF sporenie', category: 'Investments', bucket: 'Savings', amount: -300.0, dot: 'bg-savings' },
]

const currency = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const amountFormat = new Intl.NumberFormat('sk-SK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function SummaryPanel() {
  return (
    <section
      aria-labelledby="preview-heading"
      className="hidden overflow-y-auto bg-surface-contrast px-12 py-12 text-white lg:flex lg:w-[46%] lg:flex-col lg:justify-center xl:px-16"
    >
      <div className="mx-auto w-full max-w-[26rem]">
        <p className="text-caption text-on-surface-faint">September 2026</p>
        <h2 id="preview-heading" className="text-display-lg mt-2 text-balance">
          Every euro accounted for.
        </h2>
        <p className="text-body mt-3 text-on-surface-faint">
          Income {currency.format(2400)} split across needs, wants and savings.
        </p>

        {/* Shared layout: label lane, plot lane, value column. */}
        <dl className="mt-8 space-y-5">
          {BUCKETS.map(({ label, target, actual, bar }) => {
            const over = actual > target
            return (
              <div key={label}>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-heading-16">{label}</dt>
                  <dd className="numeric text-caption text-on-surface-faint">
                    <span className="text-white">{actual}%</span>
                    <span aria-hidden> / </span>
                    <span className="sr-only">of a </span>
                    {target}%<span className="sr-only"> target</span>
                  </dd>
                </div>
                {/* Zero baseline; the notch marks the target. */}
                <div className="relative mt-2.5 h-1.5 rounded-full bg-white/15">
                  <div
                    className={`h-full rounded-full ${bar}`}
                    style={{ width: `${Math.min(actual, 100)}%` }}
                  />
                  <span
                    aria-hidden
                    className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-white/60"
                    style={{ left: `${target}%` }}
                  />
                </div>
                <p className="text-caption mt-1.5 text-on-surface-faint">
                  {over
                    ? `${actual - target} points over target`
                    : `${target - actual} points to spare`}
                </p>
              </div>
            )
          })}
        </dl>

        {/* Recent transactions. Colour repeats the bucket hue above, and the
         * bucket name is always present so meaning never rests on colour. */}
        <div className="mt-8 border-t border-white/15 pt-5">
          <h3 className="text-caption text-on-surface-faint">Recent transactions</h3>
          <ul className="mt-3 divide-y divide-white/10">
            {TRANSACTIONS.map(({ merchant, category, bucket, amount, dot }) => (
              <li key={merchant} className="flex items-center gap-3 py-2.5">
                <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="text-caption block truncate font-medium text-white">
                    {merchant}
                  </span>
                  <span className="text-caption block truncate text-on-surface-faint">
                    {category} · {bucket}
                  </span>
                </span>
                <span className="numeric text-caption shrink-0 text-white">
                  −{amountFormat.format(Math.abs(amount))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-caption mt-5 text-on-surface-faint">
          Illustrative figures. The notch marks each 50/30/20 target.
        </p>
      </div>
    </section>
  )
}
