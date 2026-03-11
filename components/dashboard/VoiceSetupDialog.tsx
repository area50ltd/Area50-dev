'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, Phone, Search, X } from 'lucide-react'
import { VOICE_LANGUAGES, VOICE_TONES } from '@/lib/constants'
import type { TwilioAvailableNumber } from '@/lib/twilio'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type Step = 1 | 2 | 3

interface VoiceConfig {
  voice_language: string
  voice_tone: string
  elevenlabs_voice_id: string
}

export function VoiceSetupDialog({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [config, setConfig] = useState<VoiceConfig>({
    voice_language: 'en-US',
    voice_tone: 'professional',
    elevenlabs_voice_id: '',
  })
  const [areaCode, setAreaCode] = useState('')
  const [numbers, setNumbers] = useState<TwilioAvailableNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState('')
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successNumber, setSuccessNumber] = useState('')

  const handleSearch = async () => {
    setSearching(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (areaCode.trim()) params.set('area_code', areaCode.trim())
      const res = await fetch(`/api/vapi/numbers?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch numbers')
      const list: TwilioAvailableNumber[] = Array.isArray(data) ? data : []
      setNumbers(list)
      if (list.length === 0) setError('No numbers available for that area code. Try a different one.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load phone numbers. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleConfirm = async () => {
    if (!selectedNumber) {
      setError('Please select a phone number.')
      return
    }
    setSubmitting(true)
    setError('')
    setStep(3)
    try {
      const res = await fetch('/api/vapi/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: selectedNumber,
          voice_language: config.voice_language,
          voice_tone: config.voice_tone,
          ...(config.elevenlabs_voice_id ? { elevenlabs_voice_id: config.elevenlabs_voice_id } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Setup failed')
      setSuccessNumber(data.phone_number ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed. Please try again.')
      setStep(2)
    } finally {
      setSubmitting(false)
    }
  }

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleClose = () => {
    setStep(1)
    setNumbers([])
    setSelectedNumber('')
    setAreaCode('')
    setError('')
    const wasSuccess = !!successNumber
    setSuccessNumber('')
    onOpenChange(false)
    if (wasSuccess) onSuccess()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <h2 className="font-heading font-bold text-neutral-900">
            {step === 1 && 'Configure Your AI Voice'}
            {step === 2 && 'Choose a Phone Number'}
            {step === 3 && (successNumber ? 'Voice Line Ready!' : 'Setting Up...')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 py-3">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-violet-600' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        <div className="px-6 pb-6">

        {/* ── Step 1: Voice Config ── */}
        {step === 1 && (
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                Voice Language
              </label>
              <select
                value={config.voice_language}
                onChange={(e) => setConfig((c) => ({ ...c, voice_language: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              >
                {VOICE_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                Voice Tone
              </label>
              <select
                value={config.voice_tone}
                onChange={(e) => setConfig((c) => ({ ...c, voice_tone: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              >
                {VOICE_TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                Custom Voice ID <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                value={config.elevenlabs_voice_id}
                onChange={(e) => setConfig((c) => ({ ...c, elevenlabs_voice_id: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              />
              <p className="text-xs text-neutral-400 mt-1">Leave blank to use the default AI voice.</p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-violet-600 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              Next: Choose Phone Number →
            </button>
          </div>
        )}

        {/* ── Step 2: Phone Number Selection ── */}
        {step === 2 && (
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                Area Code <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 415"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  maxLength={5}
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Search
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {numbers.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {numbers.map((n) => (
                  <label
                    key={n.phone_number}
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                      selectedNumber === n.phone_number
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="phone_number"
                      value={n.phone_number}
                      checked={selectedNumber === n.phone_number}
                      onChange={() => setSelectedNumber(n.phone_number)}
                      className="accent-violet-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900">{n.friendly_name}</p>
                      {(n.locality || n.region) && (
                        <p className="text-xs text-neutral-400">{[n.locality, n.region].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                    <Phone size={14} className="text-neutral-400" />
                  </label>
                ))}
              </div>
            )}

            {numbers.length === 0 && !searching && !error && (
              <p className="text-sm text-neutral-400 text-center py-4">
                Enter an area code and click Search, or leave blank to see available numbers.
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-neutral-200 text-neutral-700 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedNumber || submitting}
                className="flex-1 bg-violet-600 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Set Up
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Loading / Success ── */}
        {step === 3 && (
          <div className="py-8 text-center">
            {submitting ? (
              <>
                <Loader2 size={36} className="animate-spin text-violet-600 mx-auto mb-4" />
                <p className="font-semibold text-neutral-900 mb-1">Setting up your voice line…</p>
                <p className="text-sm text-neutral-500">
                  Purchasing your number and creating your AI assistant. This takes a few seconds.
                </p>
              </>
            ) : successNumber ? (
              <>
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <p className="font-semibold text-neutral-900 mb-1">Your phone line is ready!</p>
                <p className="text-2xl font-heading font-bold text-violet-600 mt-3 mb-1">{successNumber}</p>
                <p className="text-xs text-neutral-400 mb-6">
                  Your AI assistant is now live on this number.
                </p>
                <button
                  onClick={handleClose}
                  className="bg-violet-600 text-white px-8 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <p className="text-red-600 font-semibold mb-2">Setup failed</p>
                <p className="text-sm text-neutral-500 mb-4">{error}</p>
                <button
                  onClick={() => setStep(2)}
                  className="border border-neutral-200 text-neutral-700 px-6 py-2 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
