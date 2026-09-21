/**
 * Applies supabase/functions.sql — the triggers, functions and seed data that
 * Drizzle cannot express. The file is idempotent, so re-running is safe.
 *
 * Usage: npm run db:functions
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import postgres from 'postgres'

const here = dirname(fileURLToPath(import.meta.url))
const sqlPath = join(here, '..', 'supabase', 'functions.sql')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env.local (direct connection, not the pooler).')
  process.exit(1)
}

const source = await readFile(sqlPath, 'utf8')
const sql = postgres(url, { max: 1, onnotice: () => {} })

try {
  // The whole file runs in one transaction: either every trigger and seed
  // lands, or none of them do.
  await sql.begin((tx) => tx.unsafe(source))
  console.log('Applied supabase/functions.sql')
} catch (error) {
  console.error('Failed to apply functions.sql:', error.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
