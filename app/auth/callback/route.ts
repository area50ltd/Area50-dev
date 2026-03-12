import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase auth callback — handles:
 *  - Email confirmation (signup) — PKCE code flow OR token_hash OTP flow
 *  - Magic link sign-in
 *  - OAuth callbacks (Google, GitHub) — PKCE code flow
 *  - Password reset (type=recovery) — redirects to /reset-password
 *
 * Supabase Dashboard → Authentication → URL Configuration:
 *   Redirect URLs must include:
 *     https://yourdomain.com/auth/callback
 *     http://localhost:3000/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'magiclink' | 'email_change' | null
  const next = searchParams.get('next') ?? '/auth/redirect'

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

  // --- PKCE flow: OAuth (Google) and email confirmation with code ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // For password resets, next=/reset-password is passed via the resetPasswordForEmail call
      const redirectPath = next.startsWith('/') ? next : '/auth/redirect'
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // --- OTP / token_hash flow: email confirmation when PKCE is disabled ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      const redirectPath =
        type === 'recovery'
          ? '/reset-password'
          : next.startsWith('/')
          ? next
          : '/auth/redirect'
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Something went wrong — send to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
