import type { BucketType } from './buckets'

/**
 * Tailwind classes per bucket, so a bucket looks the same everywhere it
 * appears. Full class strings, never interpolated — Tailwind only sees
 * classes it can find as literal text, so `bar` carries its whole
 * progress-indicator selector rather than being composed at the call site.
 */
export const BUCKET_STYLES: Record<
  BucketType,
  { badge: string; dot: string; bar: string; text: string }
> = {
  needs: {
    badge: 'border-transparent bg-needs-muted text-needs',
    dot: 'bg-needs',
    bar: '[&_[data-slot=progress-indicator]]:bg-needs',
    text: 'text-needs',
  },
  wants: {
    badge: 'border-transparent bg-wants-muted text-wants',
    dot: 'bg-wants',
    bar: '[&_[data-slot=progress-indicator]]:bg-wants',
    text: 'text-wants',
  },
  savings: {
    badge: 'border-transparent bg-savings-muted text-savings',
    dot: 'bg-savings',
    bar: '[&_[data-slot=progress-indicator]]:bg-savings',
    text: 'text-savings',
  },
}

/**
 * Colour for a signed amount: money in is green, money out is red.
 * Pair with `formatSigned` so the sign carries the meaning too — colour is
 * never the only channel.
 */
export function amountColor(amount: number): string {
  if (amount > 0) return 'text-positive-foreground'
  if (amount < 0) return 'text-negative-foreground'
  return 'text-muted-foreground'
}
