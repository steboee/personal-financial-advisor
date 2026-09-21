import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'

import './globals.css'

/**
 * SF Pro is the design language's typeface and renders natively on Apple
 * devices through `-apple-system` (see --font-sans in globals.css). Inter is
 * the fallback everywhere else: it shares SF Pro's proportions and optical
 * sizing closely enough that the tight display tracking still holds.
 * latin-ext is required — transaction descriptions carry Slovak diacritics.
 */
const inter = Inter({
  variable: '--font-fallback-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Financial Advisor',
  description: 'Personal finances tracked against the 50/30/20 rule.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
