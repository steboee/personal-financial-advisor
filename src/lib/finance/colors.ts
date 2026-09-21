import type { BucketType } from './buckets'

/**
 * Tailwind classes per bucket, so a bucket looks the same everywhere it
 * appears. Full class strings, never interpolated — Tailwind only sees
 * classes it can find as literal text, so `bar` carries its whole
 * progress-indicator selector rather than being composed at the call site.
 *
 * `bar` targets a shadcn `Progress`; `barFill` is the same hue for a bar
 * rendered directly, where no slot indirection is needed.
 *
 * `badge`/`text` use the -foreground variant: the base hue is tuned for
 * bars and dots (which only need 3:1) and is too light to clear 4.5:1 as
 * text on its own tint in light mode.
 */
export const BUCKET_STYLES: Record<
  BucketType,
  { badge: string; dot: string; bar: string; barFill: string; text: string }
> = {
  needs: {
    badge: 'border-transparent bg-needs-muted text-needs-foreground',
    dot: 'bg-needs',
    bar: '[&_[data-slot=progress-indicator]]:bg-needs',
    barFill: 'bg-needs',
    text: 'text-needs-foreground',
  },
  wants: {
    badge: 'border-transparent bg-wants-muted text-wants-foreground',
    dot: 'bg-wants',
    bar: '[&_[data-slot=progress-indicator]]:bg-wants',
    barFill: 'bg-wants',
    text: 'text-wants-foreground',
  },
  savings: {
    badge: 'border-transparent bg-savings-muted text-savings-foreground',
    dot: 'bg-savings',
    bar: '[&_[data-slot=progress-indicator]]:bg-savings',
    barFill: 'bg-savings',
    text: 'text-savings-foreground',
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
