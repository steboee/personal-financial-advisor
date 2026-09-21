'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from 'cn'
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BUCKET_ORDER, type BucketType } from '@/lib/finance/buckets'
import { BUCKET_STYLES } from '@/lib/finance/colors'
import { categoryName } from '@/i18n/categories'
import type { Dictionary } from '@/i18n/dictionaries'
import { formatMonth } from '@/lib/finance/format'
import type { CategoryOption } from '@/lib/finance/queries'

const ALL = 'all'

/** The params this bar owns. Sorting is not one of them, so Clear keeps it. */
const FILTER_KEYS = [
  'search',
  'month',
  'bucket',
  'category',
  'flow',
  'min',
  'max',
  'uncategorized',
] as const

export function TransactionsFilters({
  months,
  categories,
  dict,
}: {
  months: string[]
  categories: CategoryOption[]
  dict: Dictionary
}) {
  const f = dict.transactions.filters
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')

  const month = params.get('month') ?? ALL
  const bucket = params.get('bucket') ?? ALL
  const category = params.get('category') ?? ALL
  const flow = params.get('flow') ?? ALL
  const min = params.get('min') ?? ''
  const max = params.get('max') ?? ''
  const uncategorized = params.get('uncategorized') === '1'

  // Base UI's <SelectValue> shows the raw value unless the Root is given the
  // value-to-label mapping, which would print UUIDs and enum keys in triggers.
  const monthLabels = [
    { value: ALL, label: f.allMonths },
    ...months.map((m) => ({
      value: m,
      label: formatMonth(new Date(`${m}-01T00:00:00`)),
    })),
  ]
  const bucketLabels = [
    { value: ALL, label: f.allBuckets },
    ...BUCKET_ORDER.map((b) => ({ value: b, label: dict.buckets[b] })),
  ]
  const categoryLabels = [
    { value: ALL, label: f.allCategories },
    ...categories.map((c) => ({ value: c.id, label: categoryName(dict, c.name) })),
  ]
  const flowLabels = [
    { value: ALL, label: f.allFlows },
    { value: 'in', label: f.flowIn },
    { value: 'out', label: f.flowOut },
  ]

  function apply(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === ALL) next.delete(key)
      else next.set(key, value)
    }
    router.push(`?${next}`)
  }

  function clearAll() {
    const next = new URLSearchParams(params)
    for (const key of FILTER_KEYS) next.delete(key)
    setSearch('')
    router.push(`?${next}`)
  }

  // Draft state for the amount inputs, so typing does not navigate on every
  // keystroke. Committed on Apply or Enter.
  const [draftMin, setDraftMin] = useState(min)
  const [draftMax, setDraftMax] = useState(max)
  useEffect(() => {
    setDraftMin(min)
    setDraftMax(max)
  }, [min, max])

  // Debounce the search so each keystroke is not a navigation.
  useEffect(() => {
    const current = params.get('search') ?? ''
    if (search === current) return
    const id = setTimeout(() => apply({ search }), 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  /**
   * One chip per active filter, each removable in a single tap. Without this
   * the filters hidden inside the popover are invisible from the results.
   */
  const chips: { key: string; label: string; onClear: () => void; className?: string }[] = []

  if (search) {
    chips.push({ key: 'search', label: `“${search}”`, onClear: () => setSearch('') })
  }
  if (month !== ALL) {
    chips.push({
      key: 'month',
      label: monthLabels.find((m) => m.value === month)?.label ?? month,
      onClear: () => apply({ month: null }),
    })
  }
  if (bucket !== ALL) {
    const b = bucket as BucketType
    chips.push({
      key: 'bucket',
      label: dict.buckets[b] ?? bucket,
      onClear: () => apply({ bucket: null }),
      className: BUCKET_STYLES[b]?.badge,
    })
  }
  if (category !== ALL) {
    const c = categories.find((x) => x.id === category)
    chips.push({
      key: 'category',
      label: c ? categoryName(dict, c.name) : category,
      onClear: () => apply({ category: null }),
    })
  }
  if (flow !== ALL) {
    chips.push({
      key: 'flow',
      label: flow === 'in' ? f.flowIn : f.flowOut,
      onClear: () => apply({ flow: null }),
      className:
        flow === 'in'
          ? 'border-transparent bg-positive-muted text-positive-foreground'
          : 'border-transparent bg-negative-muted text-negative-foreground',
    })
  }
  if (min || max) {
    chips.push({
      key: 'amount',
      label: min && max ? `${min} – ${max} €` : min ? `≥ ${min} €` : `≤ ${max} €`,
      onClear: () => apply({ min: null, max: null }),
    })
  }
  if (uncategorized) {
    chips.push({
      key: 'uncategorized',
      label: f.uncategorizedOnly,
      onClear: () => apply({ uncategorized: null }),
    })
  }

  // Only counts what lives behind the popover, so the badge explains what is
  // otherwise out of sight.
  const advancedCount = [Boolean(min || max), uncategorized, flow !== ALL].filter(
    Boolean
  ).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={f.search}
            aria-label={f.search}
            className="pl-8"
          />
        </div>

        <Select value={month} onValueChange={(v) => apply({ month: v })} items={monthLabels}>
          <SelectTrigger className="w-40" aria-label={f.allMonths}>
            <SelectValue placeholder={f.allMonths} />
          </SelectTrigger>
          <SelectContent>
            {monthLabels.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={bucket} onValueChange={(v) => apply({ bucket: v })} items={bucketLabels}>
          <SelectTrigger className="w-36" aria-label={f.allBuckets}>
            <SelectValue placeholder={f.allBuckets} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{f.allBuckets}</SelectItem>
            {BUCKET_ORDER.map((b) => (
              <SelectItem key={b} value={b}>
                <span className={cn('size-2 shrink-0 rounded-full', BUCKET_STYLES[b].dot)} />
                {dict.buckets[b]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(v) => apply({ category: v })}
          items={categoryLabels}
        >
          <SelectTrigger className="w-44" aria-label={f.allCategories}>
            <SelectValue placeholder={f.allCategories} />
          </SelectTrigger>
          <SelectContent>
            {categoryLabels.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" aria-label={f.more}>
                <FilterIcon />
                {f.more}
                {advancedCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 size-5 justify-center rounded-full p-0 tabular-nums"
                  >
                    {advancedCount}
                  </Badge>
                )}
              </Button>
            }
          />
          <PopoverContent align="end" className="w-72 gap-4 p-4">
            <div className="flex flex-col gap-2">
              <Label>{f.allFlows}</Label>
              <Select value={flow} onValueChange={(v) => apply({ flow: v })} items={flowLabels}>
                <SelectTrigger className="w-full" aria-label={f.allFlows}>
                  <SelectValue placeholder={f.allFlows} />
                </SelectTrigger>
                <SelectContent>
                  {flowLabels.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="filter-min">{f.amount}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="filter-min"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder={f.minAmount}
                  value={draftMin}
                  onChange={(e) => setDraftMin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') apply({ min: draftMin, max: draftMax })
                  }}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder={f.maxAmount}
                  aria-label={f.maxAmount}
                  value={draftMax}
                  onChange={(e) => setDraftMax(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') apply({ min: draftMin, max: draftMax })
                  }}
                />
              </div>
            </div>

            <Label className="flex items-center gap-2 font-normal">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={uncategorized}
                onChange={(e) => apply({ uncategorized: e.target.checked ? '1' : null })}
              />
              {f.uncategorizedOnly}
            </Label>

            <Button className="w-full" onClick={() => apply({ min: draftMin, max: draftMax })}>
              {f.apply}
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{f.activeLabel}</span>
          {chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className={cn('gap-1 py-1 pr-1 font-normal', chip.className)}
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onClear}
                aria-label={`${f.remove}: ${chip.label}`}
                className="rounded-full p-0.5 transition-colors hover:bg-foreground/15"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7">
            {f.clearAll}
          </Button>
        </div>
      )}
    </div>
  )
}
