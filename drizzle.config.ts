import { defineConfig } from 'drizzle-kit'

/**
 * `DATABASE_URL` is the Supabase connection string from
 * Project settings → Database → Connection string → URI (use the direct
 * connection, not the pooler, for migrations).
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // auth.* and storage.* are managed by Supabase; never diff or drop them.
  schemaFilter: ['public'],
  entities: {
    roles: {
      provider: 'supabase',
    },
  },
  casing: 'snake_case',
  verbose: true,
  strict: true,
})
