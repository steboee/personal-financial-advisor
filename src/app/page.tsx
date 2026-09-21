import { requireUser } from '@/lib/auth'

export default async function HomePage() {
  const { user } = await requireUser()

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {user.email}. The dashboard is built in step 6.
      </p>
    </main>
  )
}
