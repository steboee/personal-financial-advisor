import type { Database } from '@/types/database'

export type BucketType = Database['public']['Enums']['bucket_type']

/** The 50/30/20 targets, as percentages of income. */
export const BUCKET_TARGETS: Record<BucketType, number> = {
  needs: 50,
  wants: 30,
  savings: 20,
}

export const BUCKET_ORDER: BucketType[] = ['needs', 'wants', 'savings']

export const BUCKET_LABELS: Record<BucketType, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
}
