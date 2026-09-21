import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { requireUser } from '@/lib/auth'
import { getLocale } from '@/i18n/dictionaries'
import { getDictionary } from '@/i18n/dictionaries'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // The real auth gate. The proxy is only an optimistic pre-filter.
  const { user } = await requireUser()
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  const navUser = {
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email!,
    email: user.email!,
    avatar: (user.user_metadata?.avatar_url as string | undefined) ?? '',
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      {/* First stop in the tab order, so keyboard users can jump the whole
          sidebar. Visible only while focused. */}
      <a
        href="#content"
        className="bg-background ring-ring sr-only z-50 rounded-md px-4 py-2 text-sm font-medium focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:ring-2"
      >
        {dict.nav.skipToContent}
      </a>

      <AppSidebar
        variant="inset"
        user={navUser}
        labels={{
          dashboard: dict.nav.dashboard,
          transactions: dict.nav.transactions,
          categories: dict.nav.categories,
          import: dict.nav.import,
          settings: dict.nav.settings,
          appName: dict.nav.appName,
          logout: dict.nav.logout,
        }}
      />
      <SidebarInset>
        <SiteHeader
          labels={{
            dashboard: dict.nav.dashboard,
            transactions: dict.nav.transactions,
            categories: dict.nav.categories,
            import: dict.nav.import,
            settings: dict.nav.settings,
          }}
        />
        <main id="content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
