'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BUCKET_ORDER } from '@/lib/finance/buckets'
import type { CategoryOption } from '@/lib/finance/queries'

import { updateTransactionCategory } from '@/app/(app)/transactions/actions'

const NONE = 'none'

/** Inline category editor. Updates optimistically and reverts on failure. */
export function CategorySelectCell({
  transactionId,
  categoryId,
  categories,
  labels,
  names,
}: {
  transactionId: string
  categoryId: string | null
  categories: CategoryOption[]
  labels: { uncategorized: string; needs: string; wants: string; savings: string }
  /** Category id → translated name, resolved on the server. */
  names: Record<string, string>
}) {
  const [pending, startTransition] = useTransition()
  const [optimisticId, setOptimisticId] = useOptimistic(categoryId)

  const grouped = BUCKET_ORDER.map((bucket) => ({
    bucket,
    items: categories.filter((c) => c.bucket === bucket),
  })).filter((g) => g.items.length > 0)

  // Base UI's <SelectValue> renders the raw value unless the Root is told how
  // each value maps to a label, which would show the category UUID.
  const itemLabels = [
    { value: NONE, label: labels.uncategorized },
    ...categories.map((c) => ({ value: c.id, label: names[c.id] ?? c.name })),
  ]

  function change(value: string | null) {
    const next = !value || value === NONE ? null : value
    startTransition(async () => {
      setOptimisticId(next)
      const res = await updateTransactionCategory(transactionId, next)
      if (!res.ok) toast.error(`Could not update category: ${res.message}`)
    })
  }

  return (
    <Select
      value={optimisticId ?? NONE}
      onValueChange={change}
      disabled={pending}
      items={itemLabels}
    >
      <SelectTrigger size="sm" className="w-full min-w-36" aria-label={labels.uncategorized}>
        <SelectValue placeholder={labels.uncategorized} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{labels.uncategorized}</SelectItem>
        {grouped.map(({ bucket, items }) => (
          <SelectGroup key={bucket}>
            <SelectLabel>{labels[bucket]}</SelectLabel>
            {items.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {names[c.id] ?? c.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
