'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireUser } from '@/lib/auth'

const NAME_MAX = 40
const KEYWORDS_MAX = 40

const categoryInput = z.object({
  name: z.string().trim().min(1).max(NAME_MAX),
  bucket: z.enum(['needs', 'wants', 'savings']),
  keywords: z.string().max(2000),
})

/**
 * Keywords are matched as lowercased substrings during import, so they are
 * normalized here rather than at match time: lowercased, de-duplicated and
 * capped, so one runaway paste cannot slow every future import.
 */
function parseKeywords(raw: string): string[] {
  const parts = raw
    .split(/[,\n]/)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set(parts)].slice(0, KEYWORDS_MAX)
}

function revalidate() {
  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/')
}

export async function createCategory(formData: FormData) {
  const { user, supabase } = await requireUser()

  const parsed = categoryInput.safeParse({
    name: formData.get('name'),
    bucket: formData.get('bucket'),
    keywords: formData.get('keywords') ?? '',
  })
  if (!parsed.success) return { ok: false as const, message: 'invalid' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: parsed.data.name,
    bucket: parsed.data.bucket,
    keywords: parseKeywords(parsed.data.keywords),
    // New categories sort after the seeded set, which stops at 900.
    sort_order: 1000,
  })

  if (error) {
    // The (user_id, name) unique constraint is the expected failure here.
    const duplicate = error.code === '23505'
    return { ok: false as const, message: duplicate ? 'duplicate' : error.message }
  }

  revalidate()
  return { ok: true as const }
}

export async function updateCategory(id: string, formData: FormData) {
  const { user, supabase } = await requireUser()

  const parsed = categoryInput.safeParse({
    name: formData.get('name'),
    bucket: formData.get('bucket'),
    keywords: formData.get('keywords') ?? '',
  })
  if (!parsed.success) return { ok: false as const, message: 'invalid' }

  const { error } = await supabase
    .from('categories')
    .update({
      name: parsed.data.name,
      bucket: parsed.data.bucket,
      keywords: parseKeywords(parsed.data.keywords),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    const duplicate = error.code === '23505'
    return { ok: false as const, message: duplicate ? 'duplicate' : error.message }
  }

  revalidate()
  return { ok: true as const }
}

/**
 * Deletes a category. Transactions that used it are not deleted — the
 * category_id foreign key is ON DELETE SET NULL, so they fall back to
 * uncategorized and can be reassigned.
 */
export async function deleteCategory(id: string) {
  const { user, supabase } = await requireUser()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { ok: false as const, message: error.message }

  revalidate()
  return { ok: true as const }
}
