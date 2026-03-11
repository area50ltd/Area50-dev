'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('session') || lower.includes('token') || lower.includes('expired') || lower.includes('invalid')) {
    return 'This reset link has expired. Please request a new one.'
  }
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('connection')) {
    return 'Connection failed. Check your internet and try again.'
  }
  return message
}

function getPasswordScore(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  return score
}

const strengthConfig = [
  { label: 'Weak',   color: 'bg-red-500' },
  { label: 'Fair',   color: 'bg-orange-400' },
  { label: 'Good',   color: 'bg-yellow-400' },
  { label: 'Strong', color: 'bg-emerald-500' },
]

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const score = getPasswordScore(password)
  const cfg = strengthConfig[score - 1] ?? strengthConfig[0]
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-[3px] flex-1 rounded-full transition-colors ${
              seg <= score ? cfg.color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium shrink-0 ${
        score <= 1 ? 'text-red-400' :
        score === 2 ? 'text-orange-400' :
        score === 3 ? 'text-yellow-400' :
        'text-emerald-400'
      }`}>{cfg.label}</span>
    </div>
  )
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})
  const [expiredLink, setExpiredLink] = useState(false)

  function validate(): boolean {
    const errors: typeof fieldErrors = {}
    if (!newPassword) errors.newPassword = 'New password is required.'
    else if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters.'
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your new password.'
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({ password: newPassword })

    if (authError) {
      const msg = mapAuthError(authError.message)
      if (authError.message.toLowerCase().includes('session') ||
          authError.message.toLowerCase().includes('token') ||
          authError.message.toLowerCase().includes('expired') ||
          authError.message.toLowerCase().includes('invalid')) {
        setExpiredLink(true)
      }
      setError(msg)
      setLoading(false)
      return
    }

    toast.success('Password updated! Signing you in...')
    window.location.href = '/dashboard'
  }

  const inputClass = (hasError?: string) =>
    `w-full h-11 px-4 rounded-lg bg-white/5 border text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
        : 'border-white/10 focus:border-violet-500 focus:ring-violet-500/20'
    }`

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
          <h2 className="font-heading text-2xl font-bold text-white mb-1">Set new password</h2>
          <p className="text-white/50 text-sm mb-8">Choose a strong password for your account.</p>

          {/* Expired link error */}
          {expiredLink ? (
            <div className="text-center space-y-4">
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>This reset link has expired. Please request a new one.</span>
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors"
              >
                Request new reset link
              </Link>
            </div>
          ) : (
            <>
              {error && !expiredLink && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* New password */}
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setFieldErrors((p) => ({ ...p, newPassword: undefined })) }}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className={inputClass(fieldErrors.newPassword) + ' pr-11'}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={newPassword} />
                  {fieldErrors.newPassword && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.newPassword}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })) }}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className={inputClass(fieldErrors.confirmPassword) + ' pr-11'}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update password'}
                </button>
              </form>

              <p className="text-center text-white/40 text-sm mt-6">
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
