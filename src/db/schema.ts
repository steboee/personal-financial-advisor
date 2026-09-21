import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { authenticatedRole, authUid, authUsers } from 'drizzle-orm/supabase'

/**
 * The single source of truth for the database schema.
 *
 * Change a table here, then run `npm run db:generate` to have drizzle-kit
 * write the migration SQL for you. Policies below are emitted as part of that
 * migration; the trigger functions that Drizzle cannot express live in
 * supabase/functions.sql and are applied by `npm run db:functions`.
 */

export const bucketType = pgEnum('bucket_type', ['needs', 'wants', 'savings'])

/**
 * The allowlist. Adding a row here is the only way to grant access —
 * authenticating with Google is not sufficient. Readable by any signed-in
 * user (so they can check their own membership) but never writable through
 * the API; inserts happen in the SQL editor.
 */
export const allowedEmails = pgTable(
  'allowed_emails',
  {
    email: text().primaryKey(),
    note: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  () => [
    pgPolicy('allowed_emails readable by authenticated', {
      for: 'select',
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS()

export const profiles = pgTable(
  'profiles',
  {
    id: uuid()
      .primaryKey()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    email: text().notNull().unique(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    pgPolicy('profiles are self-service', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.id} = ${authUid}`,
      withCheck: sql`${t.id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const categories = pgTable(
  'categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    bucket: bucketType().notNull(),
    /**
     * Lowercased substrings matched against a transaction's searchable text
     * during auto-categorization. First category with a hit wins.
     */
    keywords: text().array().notNull().default(sql`'{}'`),
    color: text(),
    isIncome: boolean('is_income').notNull().default(false),
    /**
     * Transfers between the user's own accounts are neither income nor
     * expense, and are excluded from every 50/30/20 calculation.
     */
    isTransfer: boolean('is_transfer').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('categories_user_name_key').on(t.userId, t.name),
    index('categories_user_idx').on(t.userId, t.sortOrder),
    pgPolicy('categories are owner-only', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
  ]
).enableRLS()

export const transactions = pgTable(
  'transactions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    bookedAt: date('booked_at').notNull(),
    /**
     * Signed: negative is money out, positive is money in. numeric, never a
     * float — money must stay exact.
     */
    amount: numeric({ precision: 14, scale: 2, mode: 'number' }).notNull(),
    currency: text().notNull().default('EUR'),
    description: text().notNull(),
    counterparty: text(),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    tags: text().array().notNull().default(sql`'{}'`),
    note: text(),

    // Provenance from the bank export, kept for auditing and for re-running
    // categorization later.
    source: text().notNull().default('slsp'),
    bookingType: text('booking_type'),
    bankCategory: text('bank_category'),
    variableSymbol: text('variable_symbol'),
    counterpartyIban: text('counterparty_iban'),
    raw: jsonb(),

    /**
     * sha256 over user + date + amount + normalized description. The unique
     * constraint below is what makes re-importing an overlapping date range
     * safe.
     */
    transactionHash: text('transaction_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('transactions_user_hash_key').on(t.userId, t.transactionHash),
    index('transactions_user_date_idx').on(t.userId, t.bookedAt.desc()),
    index('transactions_category_idx').on(t.categoryId),
    index('transactions_tags_idx').using('gin', t.tags),
    pgPolicy('transactions are owner-only', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
  ]
).enableRLS()

// Types inferred straight from the schema — no hand-maintained duplicates.
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type BucketType = (typeof bucketType.enumValues)[number]

/** A transaction joined with its category, as the UI consumes it. */
export type TransactionWithCategory = Transaction & {
  category: Pick<Category, 'id' | 'name' | 'bucket' | 'isIncome' | 'isTransfer'> | null
}
