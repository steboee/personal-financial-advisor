'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'

import {
  Select,
  SelectContent,
  SelectItem,
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
}: {
  transactionId: string
  categoryId: string | null
  categories: CategoryOption[]
  labels: { uncategorized: string; needs: string; wants: string; savings: string }
}) {
  const [pending, startTransition] = useTransition()
  const [optimisticId, setOptimisticId] = useOptimistic(categoryId)

  const grouped = BUCKET_ORDER.map((bucket) => ({
    bucket,
    items: categories.filter((c) => c.bucket === bucket),
  })).filter((g) => g.items.length > 0)

  function change(value: string | null) {
    const next = !value || value === NONE ? null : value
    startTransition(async () => {
      setOptimisticId(next)
      const res = await updateTransactionCategory(transactionId, next)
      if (!res.ok) toast.error(`Could not update category: ${res.message}`)
    })
  }

  return (
    <Select value={optimisticId ?? NONE} onValueChange={change} disabled={pending}>
      <SelectTrigger size="sm" className="w-full min-w-36" aria-label={labels.uncategorized}>
        <SelectValue placeholder={labels.uncategorized} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{labels.uncategorized}</SelectItem>
        {grouped.map(({ bucket, items }) => (
          <div key={bucket}>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {labels[bucket]}
            </div>
            {items.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}
