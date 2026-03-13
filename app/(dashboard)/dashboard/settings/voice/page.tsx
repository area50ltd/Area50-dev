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
import { useCompany } from '@/hooks/useCompany'
import { VOICE_LANGUAGES, VOICE_TONES, VAPI_VOICE_PROVIDERS } from '@/lib/constants'
import { PhoneNumberManager } from '@/components/dashboard/PhoneNumberManager'
import { TopBar } from '@/components/dashboard/TopBar'

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="ml-1.5 p-1 rounded hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600 flex-shrink-0"
      title="Copy"
    >
      {copied ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  )
}

// ─── Setup checklist ──────────────────────────────────────────────────────────

function SetupChecklist({ hasAssistant, hasVoiceConfig, hasPhone, isBuilding }: {
  hasAssistant: boolean; hasVoiceConfig: boolean; hasPhone: boolean; isBuilding: boolean
}) {
  const steps = [
    { label: 'AI Assistant Built', done: hasAssistant, loading: isBuilding },
    { label: 'Voice Configured', done: hasVoiceConfig, loading: false },
    { label: 'Phone Number Active', done: hasPhone, loading: false },
  ]
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
      <h2 className="font-heading font-bold text-neutral-900 text-sm mb-4">Setup Progress</h2>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 flex-1 min-w-0">
            {i > 0 && <div className="hidden sm:block h-px w-6 bg-neutral-200 flex-shrink-0" />}
            <div className="flex items-center gap-2 min-w-0">
              {step.loading ? (
                <Loader2 size={15} className="text-violet-500 animate-spin flex-shrink-0" />
              ) : step.done ? (
                <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-[15px] h-[15px] rounded-full border-2 border-neutral-300 flex-shrink-0" />
              )}
              <span className={`text-xs font-medium truncate ${
                step.done ? 'text-green-700' : step.loading ? 'text-violet-600' : 'text-neutral-400'
              }`}>
                {step.loading ? 'Building…' : step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      {!hasAssistant && !isBuilding && (
        <p className="text-xs text-amber-600 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
          Your AI assistant is being prepared. If it doesn&apos;t appear automatically, click &ldquo;Rebuild Assistant&rdquo; below.
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

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended'

// ─── Call Modal ───────────────────────────────────────────────────────────────

function CallModal({ callStatus, callSeconds, freeTestUsed, transcript, onEndCall, onClose }: {
  callStatus: CallStatus
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
  const isActive = callStatus === 'active'
  const isConnecting = callStatus === 'connecting'
  const isLive = isActive || isConnecting

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [transcript])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-700 to-violet-500 px-5 pt-5 pb-6 relative flex-shrink-0">
          <button
            onClick={isLive ? onEndCall : onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>

          <p className="text-white/70 text-xs font-medium mb-3 text-center">
            {isConnecting ? 'Connecting…' : isActive ? 'Live call' : callStatus === 'ended' ? 'Call ended' : 'Voice Agent Test'}
          </p>

          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute -inset-3 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
                </>
              )}
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isLive ? 'bg-white shadow-lg shadow-violet-900/30' : 'bg-white/20'}`}>
                {isConnecting
                  ? <Loader2 size={26} className="text-violet-600 animate-spin" />
                  : isActive
                    ? <Mic size={26} className="text-violet-600" />
                    : callStatus === 'ended'
                      ? <Volume2 size={26} className="text-white/70" />
                      : <PhoneCall size={26} className="text-white" />
                }
              </div>
            </div>
          </div>

          {isActive ? (
            <div className="text-center">
              <p className="text-white font-heading font-bold text-xl">{mins}:{secs}</p>
              <p className="text-white/60 text-[11px] mt-0.5">remaining</p>
            </div>
          ) : isConnecting ? (
            <p className="text-white/60 text-xs text-center">Setting up microphone &amp; connection…</p>
          ) : callStatus === 'ended' ? (
            <p className="text-white/70 text-xs text-center">Call complete</p>
          ) : null}
        </div>

        {/* Credit badge */}
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[140px]">
          {transcript.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2">
              {isConnecting ? (
                <p className="text-xs text-neutral-400">Waiting for connection…</p>
              ) : isActive ? (
                <>
                  <div className="flex items-center gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-400">AI is ready — start speaking</p>
                </>
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
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed transition-opacity ${
                  line.final ? 'opacity-100' : 'opacity-60'
                } ${
                  line.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
                }`}>
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

        {/* Action button */}
        <div className="px-4 pb-5 pt-2 flex-shrink-0">
          {isLive ? (
            <button
              onClick={onEndCall}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <PhoneOff size={15} /> {isConnecting ? 'Connecting…' : 'End Call'}
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

  // Voice config
  const [voiceLanguage, setVoiceLanguage] = useState('en-US')
  const [voiceTone, setVoiceTone] = useState('professional')
  const [voiceProvider, setVoiceProvider] = useState('openai')
  const [voiceId, setVoiceId] = useState('nova')
  const [savingVoice, setSavingVoice] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  if (company && !hydrated) {
    const p = company.voice_provider ?? 'openai'
    const savedId = company.elevenlabs_voice_id ?? ''
    setVoiceLanguage(company.voice_language ?? 'en-US')
    setVoiceTone(company.voice_tone ?? 'professional')
    setVoiceProvider(p)
    setVoiceId(savedId || (p === 'openai' ? 'nova' : p === 'deepgram' ? 'aura-asteria-en' : ''))
    setHydrated(true)
  }

  // Auto-build
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
      .then((res) => { if (!res.ok) throw new Error(); qc.invalidateQueries({ queryKey: ['company'] }); setAutoBuilt(true) })
      .catch(() => toast.error('Could not build assistant — try the Rebuild button below.'))
      .finally(() => setIsAutoBuilding(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id])

  // Free test flag
  const [freeTestUsed, setFreeTestUsed] = useState(false)
  useEffect(() => { setFreeTestUsed(!!localStorage.getItem('vapi_free_test_used')) }, [])

  // Call state
  const [showModal, setShowModal] = useState(false)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [callSeconds, setCallSeconds] = useState(0)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const vapiRef = useRef<import('@vapi-ai/web').default | null>(null)
  const intentionalStopRef = useRef(false)

  // Rebuild
  const [rebuilding, setRebuilding] = useState(false)

  const clearTimers = () => {
    if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null }
    if (connectionTimeoutRef.current) { clearTimeout(connectionTimeoutRef.current); connectionTimeoutRef.current = null }
  }

  const stopBrowserCall = () => {
    intentionalStopRef.current = true
    clearTimers()
    const vapi = vapiRef.current
    vapiRef.current = null
    vapi?.stop()
    setCallStatus('ended')
    setCallSeconds(0)
  }

  const startBrowserCall = async () => {
    if (!company?.vapi_assistant_id) return
    intentionalStopRef.current = false
    setCallStatus('connecting')
    setCallSeconds(0)
    setTranscript([])

    try {
      // Check mic permission before initialising SDK — gives a clear error message
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const Vapi = (await import('@vapi-ai/web')).default
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
      vapiRef.current = vapi

      // ── call-start: WebRTC is actually live ──
      vapi.on('call-start', () => {
        clearTimeout(connectionTimeoutRef.current!)
        connectionTimeoutRef.current = null
        setCallStatus('active')
        // Mark free test used only when call is genuinely live
        if (!freeTestUsed) { localStorage.setItem('vapi_free_test_used', '1'); setFreeTestUsed(true) }
        // Start countdown
        callTimerRef.current = setInterval(() => {
          setCallSeconds((s) => {
            if (s >= 119) { stopBrowserCall(); return 0 }
            return s + 1
          })
        }, 1000)
      })

      // ── call-end: clean up ──
      vapi.on('call-end', () => {
        if (intentionalStopRef.current) return // already cleaned up in stopBrowserCall
        clearTimers()
        vapiRef.current = null
        setCallStatus('ended')
        setCallSeconds(0)
      })

      // ── error: surface meaningful message ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapi.on('error', (err: any) => {
        clearTimers()
        vapiRef.current = null
        setCallStatus('ended')
        setCallSeconds(0)
        if (intentionalStopRef.current) return
        const msg = err?.message || ''
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
          toast.error('Microphone access was denied. Please allow microphone permissions and try again.')
        } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('ice')) {
          toast.error('Network error. Check your internet connection and try again.')
        } else {
          toast.error('Call ended unexpectedly. Please try again.')
        }
      })

      // ── transcript ──
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
          return [...prev, { id: `${Date.now()}-${Math.random()}`, role, text: msg.transcript, final: isFinal }]
        })
      })

      // Connection timeout — abort if call-start never fires in 20s
      connectionTimeoutRef.current = setTimeout(() => {
        if (!intentionalStopRef.current) {
          intentionalStopRef.current = true
          const v = vapiRef.current
          vapiRef.current = null
          v?.stop()
          setCallStatus('ended')
          toast.error('Connection timed out. Check your microphone and internet connection, then try again.')
        }
      }, 20_000)

      await vapi.start(company.vapi_assistant_id)
    } catch (err) {
      clearTimers()
      vapiRef.current = null
      setCallStatus('ended')
      const name = (err as Error)?.name ?? ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        toast.error('Microphone access denied. Please allow microphone permissions in your browser and try again.')
      } else if (name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.')
      } else {
        toast.error('Failed to start call. Please try again.')
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => () => {
    intentionalStopRef.current = true
    clearTimers()
    vapiRef.current?.stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveAndRebuild = async () => {
    setSavingVoice(true)
    try {
      const res = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_rebuild: true, voice_language: voiceLanguage, voice_tone: voiceTone, voice_provider: voiceProvider, voice_id: voiceId || null }),
      })
      if (!res.ok) throw new Error()
      qc.invalidateQueries({ queryKey: ['company'] })
      toast.success('Voice settings saved and assistant rebuilt.')
    } catch {
      toast.error('Failed to save voice settings.')
    } finally {
      setSavingVoice(false)
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
      if (!res.ok) throw new Error()
      qc.invalidateQueries({ queryKey: ['company'] })
      toast.success('Assistant rebuilt successfully.')
    } catch {
      toast.error('Failed to rebuild assistant.')
    } finally {
      setRebuilding(false)
    }
  }

  const handleOpenModal = () => { setShowModal(true); startBrowserCall() }
  const handleCloseModal = () => {
    if (callStatus === 'connecting' || callStatus === 'active') stopBrowserCall()
    setShowModal(false)
    setCallStatus('idle')
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
  const hasVoiceConfig = !!(company?.voice_language || company?.voice_tone)
  const hasPhone = !!company?.vapi_phone_number
  const currentProvider = VAPI_VOICE_PROVIDERS.find((p) => p.id === voiceProvider)

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Voice & Phone" credits={company?.credits ?? 0} />

      {showModal && (
        <CallModal
          callStatus={callStatus}
          callSeconds={callSeconds}
          freeTestUsed={freeTestUsed}
          transcript={transcript}
          onEndCall={stopBrowserCall}
          onClose={handleCloseModal}
        />
      )}

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl w-full mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 lg:gap-6">

            {/* ── Left column ── */}
            <div className="space-y-5 min-w-0">

              {isAutoBuilding && <BuildingBanner />}

              <SetupChecklist
                hasAssistant={isConfigured}
                hasVoiceConfig={hasVoiceConfig}
                hasPhone={hasPhone}
                isBuilding={isAutoBuilding}
              />

              <PhoneNumberManager />

              {/* ── Voice Configuration ── */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6 space-y-5">
                <h2 className="font-heading font-bold text-neutral-900">Voice Configuration</h2>

                {/* Provider picker */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">
                    Voice Provider
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {VAPI_VOICE_PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setVoiceProvider(p.id); setVoiceId(p.voices[0]?.id ?? '') }}
                        className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                          voiceProvider === p.id
                            ? 'border-violet-600 bg-violet-50'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <p className={`font-semibold leading-snug ${voiceProvider === p.id ? 'text-violet-700' : 'text-neutral-800'}`}>{p.label}</p>
                        <p className="text-neutral-400 mt-0.5 leading-tight text-[11px]">{p.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice picker */}
                {currentProvider && (
                  currentProvider.customId ? (
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
                        ElevenLabs Voice ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                        value={voiceId}
                        onChange={(e) => setVoiceId(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      />
                      <p className="text-xs text-neutral-400 mt-1">Find your voice ID in ElevenLabs → Voices</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Voice</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {currentProvider.voices.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVoiceId(v.id)}
                            className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                              voiceId === v.id
                                ? 'border-violet-600 bg-violet-50'
                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <p className={`font-semibold ${voiceId === v.id ? 'text-violet-700' : 'text-neutral-800'}`}>{v.label}</p>
                            <p className="text-neutral-400 mt-0.5 text-[11px]">{v.tags}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Language */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">Language</label>
                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                  >
                    {Object.entries(
                      VOICE_LANGUAGES.reduce<Record<string, typeof VOICE_LANGUAGES>>((acc, l) => {
                        const g = l.group ?? 'Other'; (acc[g] = acc[g] ?? []).push(l); return acc
                      }, {})
                    ).map(([group, langs]) => (
                      <optgroup key={group} label={group}>
                        {langs.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Tone */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">Tone</label>
                  <select
                    value={voiceTone}
                    onChange={(e) => setVoiceTone(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                  >
                    {VOICE_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
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

              {/* ── Test Your Voice Agent ── */}
              {isConfigured && (
                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Mic size={17} className="text-violet-600" />
                    <h2 className="font-heading font-bold text-neutral-900">Test Your Voice Agent</h2>
                  </div>
                  <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
                    Speak with your AI assistant directly in the browser.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Browser call */}
                    <button
                      onClick={handleOpenModal}
                      disabled={callStatus === 'connecting' || callStatus === 'active'}
                      className="group relative flex flex-col items-center gap-3 bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-2xl px-5 py-6 hover:from-violet-700 hover:to-violet-600 transition-all shadow-lg shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                        className="group flex flex-col items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-6 hover:border-green-300 hover:bg-green-50 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                          <Phone size={22} className="text-neutral-500 group-hover:text-green-600 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="font-heading font-bold text-sm text-neutral-800">Call the Number</p>
                          <p className="text-neutral-500 text-xs mt-0.5 font-mono">{company.vapi_phone_number}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex flex-col items-center gap-3 bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl px-5 py-6">
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

              {/* ── Assistant Status ── */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6">
                <h2 className="font-heading font-bold text-neutral-900 mb-4">Assistant Status</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 mb-1">Assistant ID</p>
                    {isConfigured ? (
                      <div className="flex items-center">
                        <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200 truncate max-w-[200px] sm:max-w-xs block">
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
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 mb-1">Phone Number</p>
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
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Sync the assistant with your latest AI personality and voice settings.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right sidebar (desktop only) ── */}
            <div className="hidden lg:block space-y-4 lg:sticky lg:top-6 lg:self-start">

              {/* Number porting card */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-700 px-5 py-5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Headphones size={18} className="text-white" />
                  </div>
                  <p className="text-white font-heading font-bold text-sm leading-snug">
                    Have an existing number?
                  </p>
                  <p className="text-white/60 text-xs mt-1 leading-relaxed">
                    We can port your current business number to your AI assistant.
                  </p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Number porting typically takes 3–5 business days.
                  </p>
                  <a
                    href={`mailto:support@zentativ.com?subject=${encodeURIComponent('Phone Number Porting Request')}`}
                    className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
                  >
                    <Mail size={13} /> Contact Support
                  </a>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={13} className="text-violet-600" />
                  <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">How it works</p>
                </div>
                <ol className="space-y-3">
                  {[
                    'AI assistant is auto-built on first visit',
                    'Configure language, tone, and voice',
                    'Purchase a phone number — connects instantly',
                    'All inbound calls handled by your AI',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-neutral-500 leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">Quick Links</p>
                <div className="space-y-1">
                  {[
                    { label: 'AI Personality Settings', href: '/dashboard/settings' },
                    { label: 'View Call Tickets', href: '/dashboard/tickets' },
                  ].map(({ label, href }) => (
                    <a key={label} href={href} className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors">
                      <span className="text-xs text-neutral-600 group-hover:text-neutral-900">{label}</span>
                      <ChevronRight size={13} className="text-neutral-300 group-hover:text-violet-600 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
