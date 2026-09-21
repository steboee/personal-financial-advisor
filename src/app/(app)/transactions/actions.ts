'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/lib/auth'

/** Changes a transaction's category. `categoryId` of null clears it. */
export async function updateTransactionCategory(transactionId: string, categoryId: string | null) {
  const { user, supabase } = await requireUser()

  const { error } = await supabase
    .from('transactions')
    .update({ category_id: categoryId })
    .eq('id', transactionId)
    // Redundant with RLS, but makes the ownership check explicit here too.
    .eq('user_id', user.id)

  if (error) return { ok: false as const, message: error.message }

  revalidatePath('/transactions')
  revalidatePath('/')
  return { ok: true as const }
}

export async function updateTransactionTags(transactionId: string, tags: string[]) {
  const { user, supabase } = await requireUser()

  const cleaned = [...new Set(tags.map((t) => t.trim()).filter(Boolean))].slice(0, 20)

  const { error } = await supabase
    .from('transactions')
    .update({ tags: cleaned })
    .eq('id', transactionId)
    .eq('user_id', user.id)

  if (error) return { ok: false as const, message: error.message }

  revalidatePath('/transactions')
  return { ok: true as const }
}
