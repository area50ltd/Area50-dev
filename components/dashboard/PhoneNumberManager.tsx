'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Phone,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  PhoneOff,
  Info,
} from 'lucide-react'
import { useCompany } from '@/hooks/useCompany'
import { PHONE_COUNTRIES } from '@/lib/constants'

// Countries Vapi's native provider can provision numbers in
const VAPI_COUNTRIES = new Set(['US', 'CA', 'GB', 'AU'])
const AREA_CODE_COUNTRIES = new Set(['US', 'CA', 'GB', 'AU'])

// ─── Release Confirmation ──────────────────────────────────────────────────────

function ReleaseConfirmPanel({ onConfirm, onCancel, releasing }: {
  onConfirm: () => void
  onCancel: () => void
  releasing: boolean
}) {
  return (
    <div className="mt-4 border border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">Release this phone number?</p>
          <p className="text-xs text-red-600 mt-1 leading-relaxed">
            This will disconnect your AI assistant from this number. Incoming calls will no longer
            be handled automatically. This action cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={releasing}
          className="flex-1 border border-neutral-200 bg-white text-neutral-700 py-2.5 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          Keep Number
        </button>
        <button
          onClick={onConfirm}
          disabled={releasing}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {releasing ? <Loader2 size={12} className="animate-spin" /> : <PhoneOff size={12} />}
          {releasing ? 'Releasing…' : 'Release Number'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PhoneNumberManager({ defaultCountry }: { defaultCountry?: string }) {
  const { data: company, isLoading } = useCompany()
  const queryClient = useQueryClient()

  const [country, setCountry] = useState(defaultCountry ?? 'US')
  const [areaCode, setAreaCode] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false)
  const [releasing, setReleasing] = useState(false)

  const handleGetNumber = async () => {
    setPurchasing(true)
    setPurchaseError('')
    try {
      const res = await fetch('/api/vapi/numbers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: `__vapi__:${country}:${areaCode.trim()}`,
          provider: 'vapi',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to provision number')
      if (data.warning) toast.warning(data.warning)
      else toast.success(`Phone number ${data.phone_number} is now active!`)
      queryClient.invalidateQueries({ queryKey: ['company'] })
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Failed to provision number. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const handleRelease = async () => {
    setReleasing(true)
    try {
      const res = await fetch('/api/vapi/numbers/release', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to release number')
      toast.success('Phone number released successfully.')
      queryClient.invalidateQueries({ queryKey: ['company'] })
      setShowReleaseConfirm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to release number')
    } finally {
      setReleasing(false)
    }
  }

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="w-32 h-4 rounded bg-neutral-100" />
            <div className="w-48 h-3 rounded bg-neutral-100" />
          </div>
        </div>
        <div className="w-full h-20 rounded-lg bg-neutral-100" />
      </div>
    )
  }

  const hasNumber = !!company?.vapi_phone_number
  const hasAssistant = !!company?.vapi_assistant_id && company.vapi_assistant_id !== 'null'
  const isVapiCountry = VAPI_COUNTRIES.has(country)

  // ── No assistant yet ──
  if (!hasAssistant) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6">
        <CardHeader />
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mt-4">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">AI assistant not ready yet</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Your AI assistant is still being configured. Once it&apos;s ready, you can get a phone number.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Active number ──
  if (hasNumber) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6">
        <CardHeader />
        <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Phone size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-heading font-bold text-neutral-900 break-all">
                {company.vapi_phone_number}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
              <CheckCircle2 size={11} />
              Connected to AI — all inbound calls handled automatically
            </p>
          </div>
          <button
            onClick={() => setShowReleaseConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <PhoneOff size={12} />
            <span className="hidden sm:inline">Release</span>
          </button>
        </div>
        {showReleaseConfirm && (
          <ReleaseConfirmPanel
            onConfirm={handleRelease}
            onCancel={() => setShowReleaseConfirm(false)}
            releasing={releasing}
          />
        )}
      </div>
    )
  }

  // ── No number — provision one ──
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6">
      <CardHeader />
      <p className="text-sm text-neutral-500 mt-1 mb-5 leading-relaxed">
        Get a dedicated phone number. Your AI assistant answers every inbound call automatically.
      </p>

      <div className="space-y-4">

        {/* Country + area code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPurchaseError('') }}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600"
            >
              {PHONE_COUNTRIES.map((grp) => (
                <optgroup key={grp.group} label={grp.group}>
                  {grp.options.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {AREA_CODE_COUNTRIES.has(country) && (
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
                Area Code <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 415"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ''))}
                maxLength={5}
                onKeyDown={(e) => e.key === 'Enter' && !purchasing && handleGetNumber()}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600"
              />
            </div>
          )}
        </div>

        {/* Vapi-supported → direct provision */}
        {isVapiCountry ? (
          <>
            <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2.5">
              <Info size={13} className="text-violet-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-violet-700 leading-relaxed">
                Vapi will instantly assign you a real phone number
                {areaCode.trim() ? ` with area code ${areaCode.trim()}` : ` in ${country}`}.
                It connects to your AI assistant immediately.
              </p>
            </div>

            {purchaseError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 leading-relaxed">{purchaseError}</p>
              </div>
            )}

            <button
              onClick={handleGetNumber}
              disabled={purchasing}
              className="w-full bg-violet-600 text-white py-3 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {purchasing ? (
                <><Loader2 size={14} className="animate-spin" /> Provisioning your number…</>
              ) : (
                <><Phone size={14} /> Get a Phone Number</>
              )}
            </button>
          </>
        ) : (
          /* Unsupported country */
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Direct provisioning not available for {country}
              </p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Vapi&apos;s provider supports <strong>US, CA, GB, and AU</strong> numbers.
                These work globally via VoIP — your customers can call from anywhere in the world.
              </p>
              <button
                onClick={() => { setCountry('US'); setPurchaseError('') }}
                className="mt-2.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors px-3 py-1.5 rounded-lg"
              >
                Switch to US →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared header ─────────────────────────────────────────────────────────────

function CardHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
        <Phone size={18} className="text-violet-600" />
      </div>
      <div>
        <h2 className="font-heading font-bold text-sm text-neutral-900">Voice & Phone</h2>
        <p className="text-xs text-neutral-500">Dedicated AI phone line for your business</p>
      </div>
    </div>
  )
}
