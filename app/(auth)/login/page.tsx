'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bot, Headphones, Phone, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (lower.includes('email not confirmed')) return 'Please confirm your email before signing in. Check your inbox.'
  if (lower.includes('over_email_send_rate_limit') || lower.includes('email rate limit') || lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes.'
  }
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('connection')) {
    return 'Connection failed. Check your internet and try again.'
  }
  return message
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') ?? '/auth/redirect'
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function handleGoogleSSO() {
    setSsoLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (error) {
      toast.error(mapAuthError(error.message))
      setSsoLoading(false)
    }
    // No setSsoLoading(false) on success — browser will navigate away
  }

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {}
    if (!email) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = mapAuthError(error.message)
      setFormError(msg)
      setLoading(false)
      return
    }
    window.location.href = redirectUrl
  }

  const inputClass = (hasError?: string) =>
    `w-full h-11 px-4 rounded-lg bg-white/5 border text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
        : 'border-white/10 focus:border-violet-500 focus:ring-violet-500/20'
    }`

  return (
    <div className="min-h-screen bg-[#070711] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-14 relative overflow-hidden bg-[#0A0010]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-purple-700/15 rounded-full blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center overflow-hidden" style={{ height: '44px' }}>
          <Image src="/images/logo/logo-dark.png" alt="Zentativ" width={360} height={108}
            className="h-32 w-auto" style={{ filter: 'brightness(0) invert(1)' }} priority />
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-heading text-4xl font-bold text-white mb-4 leading-tight">
              AI That Handles Support.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                Humans That Close Deals.
              </span>
            </h2>
            <p className="text-white/40 text-base leading-relaxed">
              Multi-channel AI customer care with smart human handoff — web, WhatsApp, and voice.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ icon: Bot, label: 'AI Powered' }, { icon: Headphones, label: 'WhatsApp' }, { icon: Phone, label: 'Voice Calls' }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-xs rounded-full px-3.5 py-1.5">
                <Icon size={12} className="text-violet-400" />{label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['AO', 'CO', 'FB'].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0A0010] bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{i}</div>
              ))}
            </div>
            <p className="text-white/50 text-sm"><strong className="text-white">120+ businesses</strong> trust Zentativ</p>
          </div>
        </div>

        <p className="text-white/20 text-xs relative z-10">© {new Date().getFullYear()} Zentativ by Digitalwebtonics</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#070711]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center overflow-hidden" style={{ height: '40px' }}>
            <Image src="/images/logo/logo-dark.png" alt="Zentativ" width={360} height={108}
              className="h-28 w-auto" style={{ filter: 'brightness(0) invert(1)' }} priority />
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-black/50">
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-white/50 text-sm mb-6">Sign in to your Zentativ account</p>

            {/* URL error alert */}
            {urlError === 'auth_callback_failed' && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>Sign-in failed. The link may have expired. Please try again.</span>
              </div>
            )}

            {/* Form-level error */}
            {formError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* SSO buttons */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSSO}
                disabled={ssoLoading || loading}
                className="w-full h-11 flex items-center justify-center gap-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ssoLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                )}
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#070711] px-3 text-white/30 text-xs uppercase tracking-widest">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={inputClass(fieldErrors.email)}
                />
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-white/60 text-sm font-medium">Password</label>
                  <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })) }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={inputClass(fieldErrors.password) + ' pr-11'}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              <button type="submit" disabled={loading || ssoLoading}
                className="w-full h-11 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-violet-400 hover:text-violet-300 font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
