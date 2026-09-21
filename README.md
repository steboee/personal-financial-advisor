# personal-financial-advisor

A private dashboard for tracking personal finances against the 50/30/20 rule,
built around Slovenská sporiteľňa (George) exports.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase
(Postgres + Auth) · Drizzle ORM

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project**, then copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

3. **Enable Google auth** in Supabase → Authentication → Providers → Google,
   and add the callback URL `http://localhost:3000/auth/callback` (plus your
   production URL) to the provider's authorized redirect URIs.

4. **Apply the schema**

   ```bash
   npm run db:setup
   ```

5. **Run it**

   ```bash
   npm run dev
   ```

## Database workflow

The schema lives in [`src/db/schema.ts`](src/db/schema.ts) as Drizzle models —
that file is the single source of truth. To change the schema, edit the models
and let Drizzle write the SQL:

```bash
npm run db:generate    # diff models -> new file in supabase/migrations/
npm run db:migrate     # apply pending migrations
```

| Script | Purpose |
| --- | --- |
| `npm run db:generate` | Generate a migration from model changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:functions` | (Re)apply triggers, policies and seed data |
| `npm run db:setup` | `db:migrate` + `db:functions` |
| `npm run db:studio` | Browse the data in Drizzle Studio |
| `npm run db:push` | Push models straight to the DB, skipping migration files (dev only) |

Tables, indexes, constraints and RLS policies are generated from the models.
Things Drizzle cannot express — trigger functions, `force row level security`,
and the starter categories — live in
[`supabase/functions.sql`](supabase/functions.sql), which is idempotent and
safe to re-run. TypeScript types are inferred from the schema, so there is no
hand-maintained type file to drift.

## Access control

Access is restricted to an allowlist, enforced in three places:

- `src/proxy.ts` — an optimistic pre-filter on every request
- `requireUser()` in [`src/lib/auth.ts`](src/lib/auth.ts) — the real gate, called
  by every page, Route Handler and Server Action
- a database trigger that refuses to create a profile for an unlisted email

Row Level Security is forced on every table, so each row is reachable only by
its owner even on a direct database connection.

To grant access, add the address to `ALLOWED_EMAILS` in `src/lib/auth.ts` and
insert it into the `allowed_emails` table.
