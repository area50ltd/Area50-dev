'use client'

import { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Loader2,
  Copy,
  RefreshCw,
  PhoneCall,
  Headphones,
  Mail,
  ChevronRight,
  Info,
  MessageSquare,
  Phone,
  PhoneOff,
  Mic,
  Gift,
  Clock,
} from 'lucide-react'
import { useCompany, useUpdateCompany } from '@/hooks/useCompany'
import { VOICE_LANGUAGES, VOICE_TONES } from '@/lib/constants'
import { PhoneNumberManager } from '@/components/dashboard/PhoneNumberManager'
import { TopBar } from '@/components/dashboard/TopBar'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handle}
      className="ml-2 p-1 rounded hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
      title="Copy"
    >
      {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  )
}

// ─── Setup checklist ──────────────────────────────────────────────────────────

function SetupChecklist({
  hasAssistant,
  hasVoiceConfig,
  hasPhone,
  isBuilding,
}: {
  hasAssistant: boolean
  hasVoiceConfig: boolean
  hasPhone: boolean
  isBuilding: boolean
}) {
  const steps = [
    {
      label: 'AI Assistant Built',
      done: hasAssistant,
      pending: isBuilding,
      pendingLabel: 'Building…',
    },
    { label: 'Voice Configured', done: hasVoiceConfig, pending: false, pendingLabel: '' },
    { label: 'Phone Number Active', done: hasPhone, pending: false, pendingLabel: '' },
  ]

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
      <h2 className="font-heading font-bold text-neutral-900 mb-4 text-sm">Setup Progress</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            {i > 0 && <div className="hidden sm:block h-px flex-1 bg-neutral-200 max-w-[32px]" />}
            <div className="flex items-center gap-2">
              {step.pending ? (
                <Loader2 size={16} className="text-violet-500 animate-spin flex-shrink-0" />
              ) : step.done ? (
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />
              )}
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  step.done
                    ? 'text-green-700'
                    : step.pending
                    ? 'text-violet-600'
                    : 'text-neutral-400'
                }`}
              >
                {step.pending ? step.pendingLabel : step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      {!hasAssistant && !isBuilding && (
        <p className="text-xs text-amber-600 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Your AI assistant is being prepared. If it doesn&apos;t build automatically, click &ldquo;Rebuild Assistant&rdquo; below.
        </p>
      )}
    </div>
  )
}

// ─── Auto-build banner ────────────────────────────────────────────────────────

function BuildingBanner() {
  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <Loader2 size={16} className="text-violet-600 animate-spin flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-violet-800">Building your AI voice assistant…</p>
        <p className="text-xs text-violet-600 mt-0.5">This takes about 10 seconds. Hold tight.</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VoiceSettingsPage() {
  const qc = useQueryClient()
  const { data: company, isLoading } = useCompany()
  const updateCompany = useUpdateCompany()

  // Voice config form state
  const [voiceLanguage, setVoiceLanguage] = useState('')
  const [voiceTone, setVoiceTone] = useState('')
  const [elevenlabsId, setElevenlabsId] = useState('')
  const [savingVoice, setSavingVoice] = useState(false)

  // Populate form from company data when loaded
  const [hydrated, setHydrated] = useState(false)
  if (company && !hydrated) {
    setVoiceLanguage(company.voice_language ?? 'en-US')
    setVoiceTone(company.voice_tone ?? 'professional')
    setElevenlabsId(company.elevenlabs_voice_id ?? '')
    setHydrated(true)
  }

  // Auto-build state
  const [isAutoBuilding, setIsAutoBuilding] = useState(false)
  const [autoBuilt, setAutoBuilt] = useState(false)

  // Auto-build on first visit if assistant not yet created
  useEffect(() => {
    if (!company || company.vapi_assistant_id) return
    if (isAutoBuilding || autoBuilt) return
    setIsAutoBuilding(true)
    fetch('/api/vapi/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force_rebuild: true }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Build failed')
        qc.invalidateQueries({ queryKey: ['company'] })
        setAutoBuilt(true)
      })
      .catch(() => toast.error('Could not build assistant — try the Rebuild button below.'))
      .finally(() => setIsAutoBuilding(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id])

  // Free test tracking
  const [freeTestUsed, setFreeTestUsed] = useState(false)
  useEffect(() => {
    setFreeTestUsed(!!localStorage.getItem('vapi_free_test_used'))
  }, [])

  // Test mode: 'browser' | 'text' | 'inbound'
  const [testMode, setTestMode] = useState<'browser' | 'text' | 'inbound'>('browser')
  const [isBrowserCalling, setIsBrowserCalling] = useState(false)
  const [callSeconds, setCallSeconds] = useState(0)
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const vapiRef = useRef<import('@vapi-ai/web').default | null>(null)

  // Text preview state
  const [textQuery, setTextQuery] = useState('')
  const [textResponse, setTextResponse] = useState('')
  const [textLoading, setTextLoading] = useState(false)

  // Rebuild only state
  const [rebuilding, setRebuilding] = useState(false)

  const handleSaveAndRebuild = async () => {
    setSavingVoice(true)
    try {
      await updateCompany.mutateAsync({
        voice_language: voiceLanguage,
        voice_tone: voiceTone,
        elevenlabs_voice_id: elevenlabsId || null,
      })
      const res = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_rebuild: true }),
      })
      if (!res.ok) throw new Error('Rebuild failed')
      qc.invalidateQueries({ queryKey: ['company'] })
      toast.success('Voice settings saved and assistant rebuilt.')
    } catch {
      toast.error('Failed to save voice settings.')
    } finally {
      setSavingVoice(false)
    }
  }

  const startBrowserCall = async () => {
    if (!company?.vapi_assistant_id) return
    setIsBrowserCalling(true)
    setCallSeconds(0)
    // Mark free test as used on first call
    if (!freeTestUsed) {
      localStorage.setItem('vapi_free_test_used', '1')
      setFreeTestUsed(true)
    }
    try {
      const Vapi = (await import('@vapi-ai/web')).default
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
      vapiRef.current = vapi
      vapi.on('call-end', stopBrowserCall)
      vapi.on('error', () => { toast.error('Call error. Please try again.'); stopBrowserCall() })
      await vapi.start(company.vapi_assistant_id)
      callTimerRef.current = setInterval(() => {
        setCallSeconds((s) => {
          if (s >= 119) { stopBrowserCall(); return 0 } // 2-minute hard cap
          return s + 1
        })
      }, 1000)
    } catch {
      toast.error('Failed to start browser call.')
      setIsBrowserCalling(false)
    }
  }

  const stopBrowserCall = () => {
    vapiRef.current?.stop()
    vapiRef.current = null
    if (callTimerRef.current) clearInterval(callTimerRef.current)
    setIsBrowserCalling(false)
    setCallSeconds(0)
  }

  useEffect(() => () => { vapiRef.current?.stop(); if (callTimerRef.current) clearInterval(callTimerRef.current) }, [])

  const handleTextPreview = async () => {
    if (!textQuery.trim()) return
    setTextLoading(true)
    setTextResponse('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company?.id,
          message: textQuery,
          session_id: 'voice-preview-test',
          ticket_id: '33333333-3333-3333-3333-333333333333',
          channel: 'web_widget',
          language: 'en',
        }),
      })
      const data = await res.json()
      const reply = data.response || data.reply || data.output || data.message || data.text
      if (!reply) {
        setTextResponse('No response — ensure your AI personality is set in Settings → AI Personality.')
      } else {
        setTextResponse(reply)
      }
    } catch {
      toast.error('Preview failed. Check your AI assistant is configured.')
    } finally {
      setTextLoading(false)
    }
  }

  const handleRebuildOnly = async () => {
    setRebuilding(true)
    try {
      const res = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_rebuild: true }),
      })
      if (!res.ok) throw new Error('Rebuild failed')
      qc.invalidateQueries({ queryKey: ['company'] })
      toast.success('Assistant rebuilt successfully.')
    } catch {
      toast.error('Failed to rebuild assistant.')
    } finally {
      setRebuilding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Voice & Phone" credits={0} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </main>
      </div>
    )
  }

  const isConfigured = !!company?.vapi_assistant_id
  const hasVoiceConfig = !!(company?.voice_language && company.voice_language !== 'en-US')
  const hasPhone = !!company?.vapi_phone_number

  // Determine default country based on company language (African market)
  const defaultCountry =
    company?.language === 'yo' || company?.language === 'ha' || company?.language === 'ig'
      ? 'NG'
      : undefined

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Voice & Phone" credits={company?.credits ?? 0} />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 max-w-5xl">

          {/* ── Left column — main settings ── */}
          <div className="space-y-6 min-w-0">

            {/* Auto-build banner */}
            {isAutoBuilding && <BuildingBanner />}

            {/* Setup checklist */}
            <SetupChecklist
              hasAssistant={isConfigured}
              hasVoiceConfig={hasVoiceConfig}
              hasPhone={hasPhone}
              isBuilding={isAutoBuilding}
            />

            {/* Phone Number (search, purchase, release) */}
            <PhoneNumberManager defaultCountry={defaultCountry} />

            {/* Nigerian number note */}
            {defaultCountry === 'NG' && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Nigeria note:</strong> Twilio doesn&apos;t provision local Nigerian mobile numbers directly.
                  If your search returns no results, try a <strong>US or UK number</strong> — it works globally
                  for all inbound/outbound calls via VoIP.
                </p>
              </div>
            )}

            {/* Voice Configuration */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
              <h2 className="font-heading font-bold text-neutral-900 mb-4">Voice Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                    Voice Language
                  </label>
                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value)}
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
                    value={voiceTone}
                    onChange={(e) => setVoiceTone(e.target.value)}
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
                    value={elevenlabsId}
                    onChange={(e) => setElevenlabsId(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                  />
                </div>

                <button
                  onClick={handleSaveAndRebuild}
                  disabled={savingVoice}
                  className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {savingVoice ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Save & Rebuild Assistant
                </button>
              </div>
            </div>

            {/* Test Your Voice Agent */}
            {isConfigured && (
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
                <h2 className="font-heading font-bold text-neutral-900 mb-1 flex items-center gap-2">
                  <Mic size={18} className="text-violet-600" />
                  Test Your Voice Agent
                </h2>
                <p className="text-sm text-neutral-500 mb-4">Choose how you want to test.</p>

                {/* Mode tabs */}
                <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl mb-5">
                  {([
                    { key: 'browser', label: 'Browser Call', icon: Mic },
                    { key: 'text', label: 'Text Preview', icon: MessageSquare },
                    { key: 'inbound', label: 'Call the Number', icon: Phone },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setTestMode(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
                        testMode === key
                          ? 'bg-white shadow-sm text-violet-700'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>

                {/* Browser Call */}
                {testMode === 'browser' && (
                  <div className="space-y-3">
                    {!freeTestUsed ? (
                      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                        <Gift size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-green-700">
                            FREE TEST — up to 2 min, on us 🎁
                          </p>
                          <p className="text-xs text-green-600 mt-0.5">
                            After your free test, additional browser calls deduct 10 credits/min.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2.5">
                        <Info size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-violet-700">
                          Calls your AI assistant live via your browser microphone. Capped at 2 minutes.
                          Uses <strong>10 credits/min</strong> from your balance.
                        </p>
                      </div>
                    )}

                    {isBrowserCalling ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                          <Clock size={13} className="text-green-700" />
                          <span className="text-sm font-medium text-green-800">
                            {Math.floor((119 - callSeconds) / 60)}:{String((119 - callSeconds) % 60).padStart(2, '0')} remaining
                          </span>
                        </div>
                        <button
                          onClick={stopBrowserCall}
                          className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <PhoneOff size={12} /> End Call
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={startBrowserCall}
                        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                      >
                        <PhoneCall size={15} /> Start Browser Call
                      </button>
                    )}
                  </div>
                )}

                {/* Text Preview */}
                {testMode === 'text' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                      <Info size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-700">
                        Free preview — sends text to the AI and shows what it would say to customers.
                        No credits deducted.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={textQuery}
                        onChange={(e) => setTextQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTextPreview()}
                        placeholder="e.g. What are your office hours?"
                        className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      />
                      <button
                        onClick={handleTextPreview}
                        disabled={textLoading || !textQuery.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40"
                      >
                        {textLoading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                        Ask
                      </button>
                    </div>
                    {textResponse && (
                      <div className="bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
                        <p className="text-xs text-neutral-500 font-semibold mb-1">AI Response:</p>
                        <p className="text-sm text-neutral-800 leading-relaxed">{textResponse}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Call the Number */}
                {testMode === 'inbound' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2.5">
                      <Info size={14} className="text-sky-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-sky-700">
                        Test the full inbound experience — call your number directly. Customers will follow the same flow.
                      </p>
                    </div>
                    {company?.vapi_phone_number ? (
                      <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                        <Phone size={16} className="text-neutral-500 flex-shrink-0" />
                        <span className="text-base font-mono font-bold text-neutral-900 flex-1">
                          {company.vapi_phone_number}
                        </span>
                        <a
                          href={`tel:${company.vapi_phone_number}`}
                          className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <PhoneCall size={12} /> Call Now
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 text-center py-3">
                        No phone number assigned yet. Purchase one above.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Assistant Status */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
              <h2 className="font-heading font-bold text-neutral-900 mb-4">Assistant Status</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500 w-32 flex-shrink-0">Assistant ID</span>
                  {company?.vapi_assistant_id ? (
                    <div className="flex items-center min-w-0">
                      <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200 truncate max-w-xs">
                        {company.vapi_assistant_id}
                      </code>
                      <CopyButton value={company.vapi_assistant_id} />
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">
                      {isAutoBuilding ? 'Building…' : 'Not created yet'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500 w-32 flex-shrink-0">Phone Number</span>
                  {company?.vapi_phone_number ? (
                    <div className="flex items-center">
                      <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                        {company.vapi_phone_number}
                      </code>
                      <CopyButton value={company.vapi_phone_number} />
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">Not assigned</span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-100">
                <button
                  onClick={handleRebuildOnly}
                  disabled={rebuilding || isAutoBuilding}
                  className="flex items-center gap-2 border border-neutral-200 text-neutral-700 px-5 py-2 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {rebuilding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Rebuild Assistant
                </button>
                <p className="text-xs text-neutral-400 mt-2">
                  Sync the assistant with your latest AI personality and voice settings.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right column — help panel (sticky on desktop) ── */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

            {/* Support card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
              {/* Gradient header */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-700 px-5 py-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                  <Headphones size={20} className="text-white" />
                </div>
                <p className="text-white font-heading font-bold text-sm leading-snug">
                  Need help connecting your existing phone number?
                </p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">
                  Already have a business number? Our team can port it to your AI assistant.
                </p>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-3">
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Number porting typically takes 3–5 business days. Reach out and we&apos;ll guide you through the process.
                </p>
                <a
                  href={`mailto:support@zentativ.com?subject=${encodeURIComponent('Phone Number Porting Request')}&body=${encodeURIComponent('Hi Zentativ team,\n\nI would like to port my existing business number to my AI assistant.\n\nMy current number: \nAccount name: \n\nPlease guide me through the process.\n\nThanks')}`}
                  className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
                >
                  <Mail size={13} />
                  Contact Support Team
                </a>
              </div>
            </div>

            {/* How it works card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info size={14} className="text-violet-600" />
                <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">How it works</p>
              </div>
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'Your AI assistant is auto-built on first visit' },
                  { step: '2', text: 'Configure language, tone, and optional custom voice' },
                  { step: '3', text: 'Purchase a phone number — it connects instantly' },
                  { step: '4', text: 'All inbound calls are handled automatically by your AI' },
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <span className="text-xs text-neutral-500 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Quick links card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">Quick Links</p>
              <div className="space-y-1">
                {[
                  { label: 'AI Personality Settings', href: '/dashboard/settings' },
                  { label: 'Test a Voice Call', href: '#test' },
                  { label: 'View Tickets from Calls', href: '/dashboard/tickets' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">
                      {label}
                    </span>
                    <ChevronRight size={13} className="text-neutral-300 group-hover:text-violet-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
