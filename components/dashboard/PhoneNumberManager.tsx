'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Phone,
  Search,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  PhoneOff,
  ExternalLink,
} from 'lucide-react'
import { useCompany } from '@/hooks/useCompany'
import { PHONE_COUNTRIES } from '@/lib/constants'

interface AvailableNumber {
  phone_number: string
  friendly_name: string
  region?: string
  locality?: string
  capabilities: { voice: boolean; SMS: boolean }
  provider: 'vapi' | 'twilio'
}


// ─── Release Confirmation ─────────────────────────────────────────────────────

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
          <p className="text-xs text-red-600 mt-0.5">
            This will disconnect your AI assistant from this number. Incoming calls will no longer
            be handled automatically. This action cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={releasing}
          className="flex-1 border border-neutral-200 bg-white text-neutral-700 py-2 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          Keep Number
        </button>
        <button
          onClick={onConfirm}
          disabled={releasing}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {releasing ? <Loader2 size={12} className="animate-spin" /> : <PhoneOff size={12} />}
          {releasing ? 'Releasing…' : 'Release Number'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PhoneNumberManager({ defaultCountry }: { defaultCountry?: string }) {
  const { data: company, isLoading } = useCompany()
  const queryClient = useQueryClient()

  const [country, setCountry] = useState(defaultCountry ?? 'US')
  const [areaCode, setAreaCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState('')
  const [searchError, setSearchError] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false)
  const [releasing, setReleasing] = useState(false)

  const handleSearch = async () => {
    setSearching(true)
    setSearchError('')
    setAvailableNumbers([])
    setSelectedNumber('')
    try {
      const params = new URLSearchParams({ country })
      if (areaCode.trim()) params.set('area_code', areaCode.trim())
      const res = await fetch(`/api/vapi/numbers/available?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch numbers')
      const list: AvailableNumber[] = Array.isArray(data) ? data : []
      if (list.length === 0) {
        setSearchError(
          ['US', 'CA', 'GB', 'AU'].includes(country)
            ? 'No numbers available for this area code. Try removing the area code filter.'
            : 'Numbers for this country aren\'t available through Vapi\'s provider. Use US, CA, GB, or AU — VoIP numbers work globally for inbound/outbound calls.'
        )
      }
      setAvailableNumbers(list)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to fetch numbers')
    } finally {
      setSearching(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedNumber) return
    const selectedEntry = availableNumbers.find((n) => n.phone_number === selectedNumber)
    const provider = selectedEntry?.provider ?? 'vapi'
    setPurchasing(true)
    try {
      const res = await fetch('/api/vapi/numbers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: selectedNumber, provider }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to purchase number')
      if (data.warning) toast.warning(data.warning)
      else toast.success(`Phone number ${data.phone_number} is now active!`)
      queryClient.invalidateQueries({ queryKey: ['company'] })
      setAvailableNumbers([])
      setSelectedNumber('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to purchase number')
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
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-6 animate-pulse">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100" />
          <div className="space-y-2">
            <div className="w-32 h-4 rounded bg-neutral-100" />
            <div className="w-56 h-3 rounded bg-neutral-100" />
          </div>
        </div>
        <div className="w-full h-16 rounded-lg bg-neutral-100" />
      </div>
    )
  }

  const hasNumber = !!company?.vapi_phone_number
  const hasAssistant = !!company?.vapi_assistant_id && company.vapi_assistant_id !== 'null'

  // ── State C: No assistant yet ──
  if (!hasAssistant) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-6">
        <CardHeader />
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mt-4">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">AI assistant not configured yet</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Set up your AI voice assistant first before adding a phone number.
            </p>
          </div>
          <a
            href="/dashboard/settings/voice"
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline flex-shrink-0"
          >
            Configure Voice <ExternalLink size={11} />
          </a>
        </div>
      </div>
    )
  }

  // ── State B: Active number ──
  if (hasNumber) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-6">
        <CardHeader />

        <div className="mt-4 flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Phone size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-heading font-bold text-neutral-900">
                {company.vapi_phone_number}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-green-700 mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Connected to AI Assistant — inbound calls handled automatically
            </p>
          </div>
          <button
            onClick={() => setShowReleaseConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <PhoneOff size={12} />
            Release
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

  // ── State A: No number yet — search + purchase ──
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-6">
      <CardHeader />

      <p className="text-sm text-neutral-500 mt-1 mb-5">
        Give your business a dedicated phone number. Inbound calls are handled automatically
        by your AI assistant.
      </p>

      {/* Country + area code */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setAvailableNumbers([]); setSelectedNumber('') }}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600"
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

        {['US', 'CA', 'GB', 'AU'].includes(country) && (
          <div className="w-36">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
              Area Code <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 415"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              maxLength={5}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600"
            />
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Search Numbers
          </button>
        </div>
      </div>

      {/* Search error */}
      {searchError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
          <AlertTriangle size={14} className="flex-shrink-0" />
          {searchError}
        </div>
      )}

      {/* Searching skeleton */}
      {searching && (
        <div className="space-y-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Results list */}
      {!searching && availableNumbers.length > 0 && (
        <div className="space-y-2 mb-5 max-h-52 overflow-y-auto">
          {availableNumbers.map((n) => (
            <label
              key={n.phone_number}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                selectedNumber === n.phone_number
                  ? 'border-violet-600 bg-violet-50 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="phone_number_select"
                value={n.phone_number}
                checked={selectedNumber === n.phone_number}
                onChange={() => setSelectedNumber(n.phone_number)}
                className="accent-violet-600"
              />
              <div className="flex-1">
                {n.phone_number.startsWith('__vapi__') ? (
                  <>
                    <p className="text-sm font-semibold text-neutral-900">
                      Vapi will assign you a number
                    </p>
                    <p className="text-xs text-neutral-400">
                      {n.region ? `Country: ${n.region}` : ''}
                      {n.locality ? ` · Preferred area code: ${n.locality}` : ''}
                      {' · Actual number shown after purchase'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-neutral-900">{n.friendly_name}</p>
                    {(n.locality || n.region) && (
                      <p className="text-xs text-neutral-400">
                        {[n.locality, n.region].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </>
                )}
              </div>
              {selectedNumber === n.phone_number && (
                <CheckCircle2 size={16} className="text-violet-600 flex-shrink-0" />
              )}
            </label>
          ))}
        </div>
      )}

      {/* Purchase CTA */}
      {availableNumbers.length > 0 && (
        <button
          onClick={handlePurchase}
          disabled={!selectedNumber || purchasing}
          className="w-full bg-violet-600 text-white py-3 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {purchasing ? (
            <><Loader2 size={14} className="animate-spin" /> Purchasing…</>
          ) : (
            <><Phone size={14} /> Get This Number</>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Shared header ────────────────────────────────────────────────────────────

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
