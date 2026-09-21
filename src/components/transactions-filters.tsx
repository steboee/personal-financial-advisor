'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BUCKET_ORDER } from '@/lib/finance/buckets'
import type { Dictionary } from '@/i18n/dictionaries'
import { formatMonth } from '@/lib/finance/format'
import type { CategoryOption } from '@/lib/finance/queries'

const ALL = 'all'

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
  const hasFilters = [month, bucket, category].some((v) => v !== ALL) || search.length > 0

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
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (!value || value === ALL) next.delete(key)
    else next.set(key, value)
    router.push(`?${next}`)
  }

  // Debounce the search so each keystroke is not a navigation.
  useEffect(() => {
    const current = params.get('search') ?? ''
    if (search === current) return
    const id = setTimeout(() => setParam('search', search), 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
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

      <Select
        value={month}
        onValueChange={(v) => setParam('month', v)}
        items={monthLabels}
      >
        <SelectTrigger className="w-40" aria-label={f.allMonths}>
          <SelectValue placeholder={f.allMonths} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{f.allMonths}</SelectItem>
          {months.map((m) => (
            <SelectItem key={m} value={m}>
              {formatMonth(new Date(`${m}-01T00:00:00`))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={bucket}
        onValueChange={(v) => setParam('bucket', v)}
        items={bucketLabels}
      >
        <SelectTrigger className="w-36" aria-label={f.allBuckets}>
          <SelectValue placeholder={f.allBuckets} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{f.allBuckets}</SelectItem>
          {BUCKET_ORDER.map((b) => (
            <SelectItem key={b} value={b}>
              {dict.buckets[b]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={category}
        onValueChange={(v) => setParam('category', v)}
        items={categoryLabels}
      >
        <SelectTrigger className="w-44" aria-label={f.allCategories}>
          <SelectValue placeholder={f.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{f.allCategories}</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearch('')
            router.push('?')
          }}
        >
          <XIcon />
          {f.clear}
        </Button>
      )}
    </div>
  )
}
