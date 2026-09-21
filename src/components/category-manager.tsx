'use client'

import { useState, useTransition } from 'react'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BUCKET_ORDER, type BucketType } from '@/lib/finance/buckets'
import { BUCKET_STYLES } from '@/lib/finance/colors'
import type { CategoryOption } from '@/lib/finance/queries'
import type { Dictionary } from '@/i18n/dictionaries'
import { t } from '@/i18n/format'

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/app/(app)/categories/actions'

/** Null means the dialog is closed; a category means edit, 'new' means add. */
type Editing = CategoryOption | 'new' | null

export function CategoryManager({
  categories,
  names,
  usage,
  dict,
}: {
  categories: CategoryOption[]
  /** Category id → translated name, resolved on the server. */
  names: Record<string, string>
  /** Category id → how many transactions currently use it. */
  usage: Record<string, number>
  dict: Dictionary
}) {
  const m = dict.categories.manage
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<CategoryOption | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    const target = editing
    if (!target) return

    startTransition(async () => {
      const res =
        target === 'new'
          ? await createCategory(formData)
          : await updateCategory(target.id, formData)

      if (!res.ok) {
        toast.error(res.message === 'duplicate' ? m.errors.duplicate : m.errors.generic)
        return
      }
      toast.success(target === 'new' ? m.created : m.updated)
      setEditing(null)
    })
  }

  function confirmDelete() {
    const target = deleting
    if (!target) return

    startTransition(async () => {
      const res = await deleteCategory(target.id)
      if (!res.ok) {
        toast.error(m.errors.generic)
        return
      }
      toast.success(m.deleted)
      setDeleting(null)
    })
  }

  return (
    <>
      <Button size="sm" onClick={() => setEditing('new')}>
        <PlusIcon />
        {m.add}
      </Button>

      <div className="grid gap-3 @3xl/main:grid-cols-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-start justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{names[cat.id] ?? cat.name}</span>
                <Badge variant="outline" className={BUCKET_STYLES[cat.bucket].badge}>
                  {dict.buckets[cat.bucket]}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {cat.keywords?.length ? cat.keywords.join(', ') : m.noKeywords}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={m.edit}
                onClick={() => setEditing(cat)}
              >
                <PencilIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={m.delete}
                onClick={() => setDeleting(cat)}
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <form action={submit}>
            <DialogHeader>
              <DialogTitle>{editing === 'new' ? m.addTitle : m.editTitle}</DialogTitle>
              <DialogDescription>{m.description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="category-name">{m.fields.name}</FieldLabel>
                <Input
                  id="category-name"
                  name="name"
                  required
                  maxLength={40}
                  defaultValue={
                    editing && editing !== 'new' ? (names[editing.id] ?? editing.name) : ''
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="category-bucket">{m.fields.bucket}</FieldLabel>
                <Select
                  name="bucket"
                  defaultValue={editing && editing !== 'new' ? editing.bucket : 'needs'}
                  items={BUCKET_ORDER.map((b) => ({ value: b, label: dict.buckets[b] }))}
                >
                  <SelectTrigger id="category-bucket" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUCKET_ORDER.map((b: BucketType) => (
                      <SelectItem key={b} value={b}>
                        {dict.buckets[b]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="category-keywords">{m.fields.keywords}</FieldLabel>
                <Textarea
                  id="category-keywords"
                  name="keywords"
                  rows={3}
                  placeholder={m.fields.keywordsPlaceholder}
                  defaultValue={
                    editing && editing !== 'new' ? (editing.keywords?.join(', ') ?? '') : ''
                  }
                />
                <FieldDescription>{m.fields.keywordsHint}</FieldDescription>
              </Field>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                {m.cancel}
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? m.saving : m.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.deleteTitle}</DialogTitle>
            <DialogDescription>
              {deleting && usage[deleting.id]
                ? t(m.deleteWithTransactions, {
                    name: names[deleting.id] ?? deleting.name,
                    count: usage[deleting.id],
                  })
                : t(m.deleteConfirm, {
                    name: deleting ? (names[deleting.id] ?? deleting.name) : '',
                  })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel}</DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending ? m.deleting : m.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
