'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboardIcon,
  ListIcon,
  TagsIcon,
  SettingsIcon,
  UploadIcon,
  WalletIcon,
} from 'lucide-react'

import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const NAV_ICONS = {
  dashboard: LayoutDashboardIcon,
  transactions: ListIcon,
  categories: TagsIcon,
  import: UploadIcon,
  settings: SettingsIcon,
} as const

const NAV_URLS = {
  dashboard: '/',
  transactions: '/transactions',
  categories: '/categories',
  import: '/import',
  settings: '/settings',
} as const

type NavKey = keyof typeof NAV_URLS

export function AppSidebar({
  user,
  labels,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string }
  labels: Record<NavKey, string> & { appName: string; logout: string }
}) {
  const pathname = usePathname()
  const navMain = (Object.keys(NAV_URLS) as NavKey[]).map((key) => ({
    key,
    title: labels[key],
    url: NAV_URLS[key],
    icon: NAV_ICONS[key],
  }))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <WalletIcon className="size-5!" />
              <span className="text-base font-semibold">{labels.appName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {navMain.map((item) => {
                const isActive =
                  item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} logoutLabel={labels.logout} />
      </SidebarFooter>
    </Sidebar>
  )
}
