/**
 * App mark: three arcs at 50/30/20 proportions, in the bucket colours used
 * throughout the app. Decorative — the wordmark beside it carries the name.
 */
export function BrandMark({ className }: { className?: string }) {
  const R = 13
  const C = 2 * Math.PI * R
  const GAP = 5

  // Arc lengths follow the 50/30/20 split, minus a gap between each.
  const arcs = [
    { pct: 50, color: 'var(--needs)' },
    { pct: 30, color: 'var(--wants)' },
    { pct: 20, color: 'var(--savings)' },
  ]

  let offset = 0

  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Financial Advisor">
      <g transform="rotate(-90 16 16)" fill="none" strokeWidth={5} strokeLinecap="round">
        {arcs.map(({ pct, color }) => {
          const len = (C * pct) / 100 - GAP
          const el = (
            <circle
              key={pct}
              cx={16}
              cy={16}
              r={R}
              stroke={color}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          )
          offset += (C * pct) / 100
          return el
        })}
      </g>
    </svg>
  )
}
