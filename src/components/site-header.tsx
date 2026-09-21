'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function SiteHeader({
  labels,
}: {
  labels: {
    dashboard: string
    transactions: string
    categories: string
    import: string
    settings: string
  }
}) {
  const pathname = usePathname()
  const titles: Record<string, string> = {
    '/': labels.dashboard,
    '/transactions': labels.transactions,
    '/categories': labels.categories,
    '/import': labels.import,
    '/settings': labels.settings,
  }
  const title = titles[pathname] ?? labels.dashboard
  const isRoot = pathname === '/'

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {isRoot ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{labels.dashboard}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink render={<Link href="/" />}>{labels.dashboard}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
