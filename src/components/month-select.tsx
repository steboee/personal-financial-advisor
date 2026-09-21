'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatMonth } from '@/lib/finance/format'

/** Drives the `month` search param for a page scoped to one month. */
export function MonthSelect({
  months,
  value,
  allLabel,
}: {
  months: string[]
  value: string
  /** Shown for the "no month filter" option; omit to require a month. */
  allLabel?: string
}) {
  const router = useRouter()
  const params = useSearchParams()

  const label = (m: string) => formatMonth(new Date(`${m}-01T00:00:00`))

  // Base UI's <SelectValue> renders the raw value unless the Root is given
  // the value-to-label mapping, which would print "2026-09" in the trigger.
  const items = [
    ...(allLabel ? [{ value: 'all', label: allLabel }] : []),
    ...months.map((m) => ({ value: m, label: label(m) })),
  ]

  function change(next: string | null) {
    const params_ = new URLSearchParams(params)
    if (!next || next === 'all') params_.delete('month')
    else params_.set('month', next)
    router.push(`?${params_}`)
  }

  return (
    <Select value={value} onValueChange={change} items={items}>
      <SelectTrigger className="w-44" aria-label={allLabel ?? label(value)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value="all">{allLabel}</SelectItem>}
        {months.map((m) => (
          <SelectItem key={m} value={m}>
            {label(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
