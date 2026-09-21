import type { MetadataRoute } from 'next'

/**
 * Installed-app metadata. `display: 'standalone'` is what drops the browser
 * chrome once the app is added to the iOS/Android home screen, so navigating
 * to /transactions no longer shows a URL bar.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Financial Advisor',
    short_name: 'Finances',
    description: 'Personal finances tracked against the 50/30/20 rule.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
