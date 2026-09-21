import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import { Toaster } from '@/components/ui/sonner'

import './globals.css'

export const metadata: Metadata = {
  title: 'Financial Advisor',
  description: 'Personal finances tracked against the 50/30/20 rule.',
  // iOS ignores the manifest's `display`, so standalone mode on the home
  // screen comes from these tags instead.
  appleWebApp: {
    capable: true,
    title: 'Finances',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  // `viewportFit: 'cover'` lets the layout reach under the notch; the safe-area
  // padding in globals.css keeps content clear of it.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#242424' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
