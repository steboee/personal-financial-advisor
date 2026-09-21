import { NextResponse, type NextRequest } from 'next/server'

import { isAllowedEmail } from '@/lib/auth'
import { updateSession } from '@/lib/supabase/proxy'

/** Routes reachable without a session. Everything else requires one. */
const PUBLIC_PATHS = ['/login', '/auth/callback', '/auth/signout']

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user, supabase } = await updateSession(request)

  const allowed = Boolean(user) && isAllowedEmail(user!.email)

  // Authenticated with the provider but not on the allowlist: sign them out so
  // a stale session cannot sit around, and bounce to login with a reason.
  if (user && !allowed) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = '?error=not_allowed'
    return NextResponse.redirect(url)
  }

  if (!allowed && !isPublic(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  if (allowed && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and metadata files. Auth routes stay
     * matched on purpose so the session cookie is refreshed there too.
     *
     * manifest.webmanifest must stay public: the browser fetches it without
     * credentials, so redirecting it to /login breaks home-screen install.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
