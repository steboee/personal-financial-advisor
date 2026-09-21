/**
 * Database types, derived from the Drizzle schema in src/db/schema.ts.
 *
 * Nothing here is hand-maintained: change a column in the schema and these
 * follow automatically. The Supabase JS client is typed through `Database`
 * below so its query builder stays in sync with the real tables.
 */
import type {
  allowedEmails,
  categories,
  profiles,
  transactions,
} from '@/db/schema'

export type {
  BucketType,
  Category,
  NewCategory,
  NewTransaction,
  Profile,
  Transaction,
  TransactionWithCategory,
} from '@/db/schema'

type Row<T extends { $inferSelect: unknown }> = T['$inferSelect']
type Insert<T extends { $inferInsert: unknown }> = T['$inferInsert']

/**
 * Supabase speaks snake_case over the wire, while Drizzle models expose
 * camelCase. This maps one to the other so `supabase.from(...)` is typed
 * against the column names the API actually returns.
 */
type SnakeCase<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Tail extends Uncapitalize<Tail>
    ? `${Uncapitalize<Head>}${SnakeCase<Tail>}`
    : `${Uncapitalize<Head>}_${SnakeCase<Tail>}`
  : S

type SnakeKeys<T> = { [K in keyof T as K extends string ? SnakeCase<K> : K]: T[K] }

export type ProfileRow = SnakeKeys<Row<typeof profiles>>
export type CategoryRow = SnakeKeys<Row<typeof categories>>
export type TransactionRow = SnakeKeys<Row<typeof transactions>>
export type AllowedEmailRow = SnakeKeys<Row<typeof allowedEmails>>

type CategoryInsert = SnakeKeys<Insert<typeof categories>>
type TransactionInsert = SnakeKeys<Insert<typeof transactions>>
type ProfileInsert = SnakeKeys<Insert<typeof profiles>>

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
      }
      categories: {
        Row: CategoryRow
        Insert: CategoryInsert
        Update: Partial<CategoryInsert>
      }
      transactions: {
        Row: TransactionRow
        Insert: TransactionInsert
        Update: Partial<TransactionInsert>
      }
      allowed_emails: {
        Row: AllowedEmailRow
        Insert: SnakeKeys<Insert<typeof allowedEmails>>
        Update: Partial<SnakeKeys<Insert<typeof allowedEmails>>>
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: { bucket_type: 'needs' | 'wants' | 'savings' }
    CompositeTypes: Record<never, never>
  }
}

/** A transaction row joined with its category, as the UI consumes it. */
export type TransactionRowWithCategory = TransactionRow & {
  category: Pick<CategoryRow, 'id' | 'name' | 'bucket' | 'is_income' | 'is_transfer'> | null
}
