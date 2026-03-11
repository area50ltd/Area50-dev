'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit') || lower.includes('email rate limit')) {
    return 'Please wait a few minutes before requesting another link.'
  }
  if (lower.includes('user not found') || lower.includes('unable to validate')) {
    return 'No account found with that email address.'
  }
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('connection')) {
    return 'Connection failed. Check your internet and try again.'
  }
  return message
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    if (authError) {
      setError(mapAuthError(authError.message))
      setLoading(false)
      return
    }
    setSentTo(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#070711] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center overflow-hidden" style={{ height: '40px' }}>
            <Image
              src="/images/logo/logo-dark.png"
              alt="Zentativ"
              width={360}
              height={108}
              className="h-28 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
              priority
            />
          </Link>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-black/50">
          {!sent ? (
            <>
              {/* Back link */}
              <Link href="/login" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
                <ArrowLeft size={14} />
                Back to sign in
              </Link>

              <h2 className="font-heading text-2xl font-bold text-white mb-1">Forgot your password?</h2>
              <p className="text-white/50 text-sm mb-8">Enter your email and we&apos;ll send you a reset link.</p>

              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null) }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={28} className="text-violet-400" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-white mb-3">Check your inbox</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-2">
                  We sent a password reset link to
                </p>
                <p className="text-white font-medium text-sm mb-6 break-all">{sentTo}</p>
                <p className="text-white/40 text-sm mb-8">
                  Didn&apos;t receive it? Check your spam folder, or{' '}
                  <button
                    type="button"
                    onClick={() => { setSent(false); setEmail(sentTo) }}
                    className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    try again
                  </button>
                  .
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
