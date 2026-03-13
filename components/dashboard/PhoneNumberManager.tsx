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
  Mail,
  MessageSquare,
} from 'lucide-react'
import { useCompany } from '@/hooks/useCompany'

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

export function PhoneNumberManager() {
  const { data: company, isLoading } = useCompany()
  const queryClient = useQueryClient()

  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false)
  const [releasing, setReleasing] = useState(false)

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

  // ── No number — contact us ──
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6">
      <CardHeader />
      <p className="text-sm text-neutral-500 mt-1 mb-5 leading-relaxed">
        Get a dedicated phone number and let your AI assistant handle every inbound call automatically.
      </p>

      <div className="rounded-xl border border-violet-100 bg-violet-50 px-5 py-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-violet-900">We set it up for you</p>
          <p className="text-xs text-violet-700 mt-1 leading-relaxed">
            Our team provisions and connects your dedicated phone number — usually within one business day.
            Numbers work globally via VoIP, so your customers can call from anywhere.
          </p>
        </div>

        <ul className="space-y-2">
          {[
            'US, UK, Canadian, and Australian numbers available',
            'Instantly connected to your AI assistant',
            'Inbound calls answered 24/7 automatically',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-violet-800">
              <CheckCircle2 size={13} className="text-violet-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <a
            href="mailto:support@zentativ.com?subject=Phone%20Number%20Setup%20Request"
            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white py-2.5 rounded-full text-xs font-semibold hover:bg-violet-700 transition-colors"
          >
            <Mail size={13} />
            Email Us to Get Started
          </a>
          <a
            href="https://wa.me/message/XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 border border-violet-200 text-violet-700 py-2.5 rounded-full text-xs font-semibold hover:bg-violet-100 transition-colors"
          >
            <MessageSquare size={13} />
            Chat on WhatsApp
          </a>
        </div>

        <p className="text-[10px] text-violet-500 text-center">
          Typically activated within 1 business day · No extra charge on Growth &amp; Business plans
        </p>
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
