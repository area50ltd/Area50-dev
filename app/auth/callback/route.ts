import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase auth callback — handles:
 *  - Email confirmation (signup)
 *  - Magic link sign-in
 *  - OAuth callbacks (Google, GitHub)
 *  - Password reset (type=recovery) — redirects to /reset-password
 *
 * Supabase Dashboard → Authentication → URL Configuration:
 *   Redirect URLs: http://localhost:3000/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/redirect'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // `next` param carries the post-auth destination.
      // For password resets, resetPasswordForEmail sets next=/reset-password,
      // so we honour it directly — no separate type check needed.
      const redirectPath = next.startsWith('/') ? next : '/auth/redirect'
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Something went wrong — send to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
