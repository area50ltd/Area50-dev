import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Truly public UI routes — no auth check needed
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/auth/redirect',
  '/auth/callback',
  '/widget',
  '/privacy',
  '/terms',
]

// API routes that don't need Clerk/Supabase session protection at the middleware level
// (each route handler does its own auth via getCurrentUser())
const PUBLIC_API_PREFIXES = [
  '/api/webhooks',
  '/api/payment/webhook',
  '/api/vapi/widget-call',
  '/api/widget',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 1. Supabase Site URL fallback catcher.
  //    When Supabase can't match the redirectTo against its allowed list it falls
  //    back to the configured Site URL (e.g. https://zentativ.com/) and appends
  //    the auth params there.  We intercept any request to "/" that carries a
  //    Supabase auth param and forward it to /auth/callback so the code-exchange
  //    runs correctly.
  if (pathname === '/' && (searchParams.has('code') || searchParams.has('token_hash'))) {
    const callbackUrl = new URL('/auth/callback', request.url)
    searchParams.forEach((value, key) => callbackUrl.searchParams.set(key, value))
    return NextResponse.redirect(callbackUrl)
  }

  // 2. All API routes: skip middleware session refresh.
  //    Each route handler calls getCurrentUser() which calls getUser() internally.
  //    Running getUser() twice (middleware + handler) wastes ~200ms per request.
  if (pathname.startsWith('/api/')) {
    // Still block unauthenticated access to protected API routes
    if (!isPublicApi(pathname)) {
      // Let the route handler handle auth — it already does via getCurrentUser()
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  // 3. Truly public UI pages — skip session refresh entirely
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // 4. Protected UI pages — refresh session token and enforce auth
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() contacts Supabase Auth to validate + refresh the session token.
  // Only called for protected page routes (not API routes — see above).
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf)).*)',
    '/(api|trpc)(.*)',
  ],
}
