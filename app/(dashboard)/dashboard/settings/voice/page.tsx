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
  Phone,
  PhoneOff,
  Mic,
  Gift,
  X,
  Volume2,
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
  hasAssistant, hasVoiceConfig, hasPhone, isBuilding,
}: {
  hasAssistant: boolean; hasVoiceConfig: boolean; hasPhone: boolean; isBuilding: boolean
}) {
  const steps = [
    { label: 'AI Assistant Built', done: hasAssistant, pending: isBuilding, pendingLabel: 'Building…' },
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
              <span className={`text-xs font-medium whitespace-nowrap ${step.done ? 'text-green-700' : step.pending ? 'text-violet-600' : 'text-neutral-400'}`}>
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

// ─── Transcript types ─────────────────────────────────────────────────────────

interface TranscriptLine {
  id: string
  role: 'user' | 'assistant'
  text: string
  final: boolean
}

// ─── Call Modal ───────────────────────────────────────────────────────────────

function CallModal({
  isActive,
  callSeconds,
  freeTestUsed,
  transcript,
  onEndCall,
  onClose,
}: {
  isActive: boolean
  callSeconds: number
  freeTestUsed: boolean
  transcript: TranscriptLine[]
  onEndCall: () => void
  onClose: () => void
}) {
  const remaining = 119 - callSeconds
  const mins = Math.floor(remaining / 60)
  const secs = String(remaining % 60).padStart(2, '0')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-700 to-violet-500 px-5 pt-5 pb-6 relative flex-shrink-0">
          <button
            onClick={isActive ? onEndCall : onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>

          <p className="text-white/70 text-xs font-medium mb-3 text-center">
            {isActive ? 'Live call' : transcript.length > 0 ? 'Call ended' : 'Voice Agent Test'}
          </p>

          {/* Pulsing circle */}
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute -inset-3 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
                </>
              )}
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white shadow-lg shadow-violet-900/30' : 'bg-white/20'}`}>
                {isActive
                  ? <Mic size={26} className="text-violet-600" />
                  : transcript.length > 0
                    ? <Volume2 size={26} className="text-white/70" />
                    : <PhoneCall size={26} className="text-white" />
                }
              </div>
            </div>
          </div>

          {/* Timer / status */}
          {isActive ? (
            <div className="text-center">
              <p className="text-white font-heading font-bold text-xl">{mins}:{secs}</p>
              <p className="text-white/60 text-[11px] mt-0.5">remaining</p>
            </div>
          ) : transcript.length > 0 ? (
            <p className="text-white/70 text-xs text-center">Call complete</p>
          ) : (
            <p className="text-white font-heading font-bold text-center">Connecting…</p>
          )}
        </div>

        {/* Free / credits badge */}
        <div className="px-4 pt-3 flex-shrink-0">
          {!freeTestUsed ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
              <Gift size={12} className="text-green-600 flex-shrink-0" />
              <p className="text-xs font-semibold text-green-700">FREE test — up to 2 min, on us 🎁</p>
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-1.5">
              <Info size={12} className="text-violet-500 flex-shrink-0" />
              <p className="text-xs text-violet-700">Using <strong>10 credits/min</strong></p>
            </div>
          ) : null}
        </div>

        {/* Transcript */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[140px]"
        >
          {transcript.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              {isActive ? (
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-xs text-neutral-300">Transcript will appear here during the call</p>
              )}
            </div>
          ) : (
            transcript.map((line) => (
              <div key={line.id} className={`flex gap-2 ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {line.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Volume2 size={10} className="text-violet-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed transition-opacity ${
                    line.final ? 'opacity-100' : 'opacity-60'
                  } ${
                    line.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
                  }`}
                >
                  {line.text}
                </div>
                {line.role === 'user' && (
                  <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mic size={10} className="text-white" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* End call button */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          {isActive ? (
            <button
              onClick={onEndCall}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={15} /> End Call
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 border border-neutral-200 text-neutral-600 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
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

  useEffect(() => {
    if (!company || (company.vapi_assistant_id && company.vapi_assistant_id !== 'null')) return
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

  // Modal state
  const [showModal, setShowModal] = useState(false)

  // Call state
  const [isBrowserCalling, setIsBrowserCalling] = useState(false)
  const [callSeconds, setCallSeconds] = useState(0)
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const vapiRef = useRef<import('@vapi-ai/web').default | null>(null)
  const intentionalStopRef = useRef(false)

  // Transcript state
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])

  // Rebuild state
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

  const stopBrowserCall = () => {
    intentionalStopRef.current = true
    vapiRef.current?.stop()
    vapiRef.current = null
    if (callTimerRef.current) clearInterval(callTimerRef.current)
    setIsBrowserCalling(false)
    setCallSeconds(0)
  }

  const startBrowserCall = async () => {
    if (!company?.vapi_assistant_id) return
    intentionalStopRef.current = false
    setIsBrowserCalling(true)
    setCallSeconds(0)
    if (!freeTestUsed) {
      localStorage.setItem('vapi_free_test_used', '1')
      setFreeTestUsed(true)
    }
    try {
      const Vapi = (await import('@vapi-ai/web')).default
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
      vapiRef.current = vapi
      vapi.on('call-end', () => {
        if (callTimerRef.current) clearInterval(callTimerRef.current)
        setIsBrowserCalling(false)
        setCallSeconds(0)
        vapiRef.current = null
      })
      vapi.on('error', () => {
        // Only show error toast if call wasn't intentionally stopped
        if (!intentionalStopRef.current) {
          toast.error('Call ended unexpectedly. Please try again.')
        }
        if (callTimerRef.current) clearInterval(callTimerRef.current)
        setIsBrowserCalling(false)
        setCallSeconds(0)
        vapiRef.current = null
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapi.on('message', (msg: any) => {
        if (msg?.type !== 'transcript') return
        const role = msg.role as 'user' | 'assistant'
        const isFinal = msg.transcriptType === 'final'
        setTranscript((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === role && !last.final) {
            return [...prev.slice(0, -1), { ...last, text: msg.transcript, final: isFinal }]
          }
          return [...prev, { id: `${Date.now()}-${role}`, role, text: msg.transcript, final: isFinal }]
        })
      })
      await vapi.start(company.vapi_assistant_id)
      callTimerRef.current = setInterval(() => {
        setCallSeconds((s) => {
          if (s >= 119) { stopBrowserCall(); return 0 }
          return s + 1
        })
      }, 1000)
    } catch {
      toast.error('Failed to start browser call. Check microphone permissions.')
      setIsBrowserCalling(false)
    }
  }

  useEffect(() => () => {
    intentionalStopRef.current = true
    vapiRef.current?.stop()
    if (callTimerRef.current) clearInterval(callTimerRef.current)
  }, [])

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

  const handleOpenModal = () => {
    setTranscript([])
    setShowModal(true)
    startBrowserCall()
  }

  const handleCloseModal = () => {
    if (isBrowserCalling) stopBrowserCall()
    setShowModal(false)
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

  const isConfigured = !!company?.vapi_assistant_id && company.vapi_assistant_id !== 'null'
  const hasVoiceConfig = !!(company?.voice_language && company.voice_language !== 'en-US')
  const hasPhone = !!company?.vapi_phone_number

  const defaultCountry =
    company?.language === 'yo' || company?.language === 'ha' || company?.language === 'ig'
      ? 'NG'
      : undefined

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Voice & Phone" credits={company?.credits ?? 0} />

      {/* Call modal */}
      {showModal && (
        <CallModal
          isActive={isBrowserCalling}
          callSeconds={callSeconds}
          freeTestUsed={freeTestUsed}
          transcript={transcript}
          onEndCall={stopBrowserCall}
          onClose={handleCloseModal}
        />
      )}

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 max-w-5xl">

          {/* ── Left column ── */}
          <div className="space-y-6 min-w-0">

            {isAutoBuilding && <BuildingBanner />}

            <SetupChecklist
              hasAssistant={isConfigured}
              hasVoiceConfig={hasVoiceConfig}
              hasPhone={hasPhone}
              isBuilding={isAutoBuilding}
            />

            <PhoneNumberManager defaultCountry={defaultCountry} />

            {defaultCountry === 'NG' && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Nigeria note:</strong> Twilio doesn&apos;t provision local Nigerian mobile numbers directly.
                  Try a <strong>US or UK number</strong> — it works globally for all inbound/outbound calls via VoIP.
                </p>
              </div>
            )}

            {/* Voice Configuration */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
              <h2 className="font-heading font-bold text-neutral-900 mb-4">Voice Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">Voice Language</label>
                  <select value={voiceLanguage} onChange={(e) => setVoiceLanguage(e.target.value)} className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500">
                    {VOICE_LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">Voice Tone</label>
                  <select value={voiceTone} onChange={(e) => setVoiceTone(e.target.value)} className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500">
                    {VOICE_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                    Custom Voice ID <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" placeholder="e.g. 21m00Tcm4TlvDq8ikWAM" value={elevenlabsId} onChange={(e) => setElevenlabsId(e.target.value)} className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
                </div>
                <button onClick={handleSaveAndRebuild} disabled={savingVoice} className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
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
                <p className="text-sm text-neutral-500 mb-5">
                  Speak with your AI assistant directly in the browser, or call your number.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Browser test button */}
                  <button
                    onClick={handleOpenModal}
                    className="group relative flex flex-col items-center gap-3 bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-2xl px-5 py-6 hover:from-violet-700 hover:to-violet-600 transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <PhoneCall size={22} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-heading font-bold text-sm">Browser Call</p>
                      <p className="text-white/70 text-xs mt-0.5">
                        {!freeTestUsed ? '🎁 Free test — 2 min' : '10 credits/min · 2 min max'}
                      </p>
                    </div>
                  </button>

                  {/* Call the number */}
                  {company?.vapi_phone_number ? (
                    <a
                      href={`tel:${company.vapi_phone_number}`}
                      className="group flex flex-col items-center gap-3 bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-2xl px-5 py-6 hover:border-green-300 hover:bg-green-50 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                        <Phone size={22} className="text-neutral-500 group-hover:text-green-600 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="font-heading font-bold text-sm">Call the Number</p>
                        <p className="text-neutral-500 text-xs mt-0.5 font-mono">{company.vapi_phone_number}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 bg-neutral-50 border border-dashed border-neutral-200 text-neutral-400 rounded-2xl px-5 py-6">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                        <Phone size={22} className="text-neutral-300" />
                      </div>
                      <div className="text-center">
                        <p className="font-heading font-bold text-sm text-neutral-400">No Number Yet</p>
                        <p className="text-neutral-400 text-xs mt-0.5">Purchase a number above</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assistant Status */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
              <h2 className="font-heading font-bold text-neutral-900 mb-4">Assistant Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500 w-32 flex-shrink-0">Assistant ID</span>
                  {isConfigured ? (
                    <div className="flex items-center min-w-0">
                      <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200 truncate max-w-xs">
                        {company!.vapi_assistant_id}
                      </code>
                      <CopyButton value={company!.vapi_assistant_id!} />
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
                <button onClick={handleRebuildOnly} disabled={rebuilding || isAutoBuilding} className="flex items-center gap-2 border border-neutral-200 text-neutral-700 px-5 py-2 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50">
                  {rebuilding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Rebuild Assistant
                </button>
                <p className="text-xs text-neutral-400 mt-2">Sync the assistant with your latest AI personality and voice settings.</p>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-700 px-5 py-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                  <Headphones size={20} className="text-white" />
                </div>
                <p className="text-white font-heading font-bold text-sm leading-snug">Need help connecting your existing phone number?</p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">Already have a business number? Our team can port it to your AI assistant.</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-xs text-neutral-500 leading-relaxed">Number porting typically takes 3–5 business days.</p>
                <a
                  href={`mailto:support@zentativ.com?subject=${encodeURIComponent('Phone Number Porting Request')}&body=${encodeURIComponent('Hi Zentativ team,\n\nI would like to port my existing business number to my AI assistant.\n\nMy current number: \nAccount name: \n\nPlease guide me through the process.\n\nThanks')}`}
                  className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
                >
                  <Mail size={13} /> Contact Support Team
                </a>
              </div>
            </div>

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
                    <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</span>
                    <span className="text-xs text-neutral-500 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">Quick Links</p>
              <div className="space-y-1">
                {[
                  { label: 'AI Personality Settings', href: '/dashboard/settings' },
                  { label: 'View Tickets from Calls', href: '/dashboard/tickets' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">{label}</span>
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
