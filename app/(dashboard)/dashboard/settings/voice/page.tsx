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
  Zap,
  MessageCircle,
} from 'lucide-react'
import { useCompany } from '@/hooks/useCompany'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'
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

// ─── Step badge ───────────────────────────────────────────────────────────────

function StepBadge({ number, done, loading }: { number: number; done: boolean; loading?: boolean }) {
  if (loading) return (
    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
      <Loader2 size={14} className="text-violet-600 animate-spin" />
    </div>
  )
  if (done) return (
    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
      <CheckCircle2 size={15} className="text-green-600" />
    </div>
  )
  return (
    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-neutral-500">{number}</span>
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
  const { hasVoice, isLoading: limitsLoading } = usePlanLimits()

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
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const Vapi = (await import('@vapi-ai/web')).default
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
      vapiRef.current = vapi

      vapi.on('call-start', () => {
        clearTimeout(connectionTimeoutRef.current!)
        connectionTimeoutRef.current = null
        setCallStatus('active')
        if (!freeTestUsed) { localStorage.setItem('vapi_free_test_used', '1'); setFreeTestUsed(true) }
        callTimerRef.current = setInterval(() => {
          setCallSeconds((s) => {
            if (s >= 119) { stopBrowserCall(); return 0 }
            return s + 1
          })
        }, 1000)
      })

      vapi.on('call-end', () => {
        if (intentionalStopRef.current) return
        clearTimers()
        vapiRef.current = null
        setCallStatus('ended')
        setCallSeconds(0)
      })

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
  const allDone = isConfigured && hasVoiceConfig && hasPhone

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

      <main className="flex-1 overflow-auto bg-neutral-50">
        <div className="max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">

          {/* ── Plan gate ── */}
          {!limitsLoading && !hasVoice && (
            <UpgradePrompt
              feature="Voice Calls"
              requiredPlan="growth"
              description="Voice calling is available on the Growth plan and above. Upgrade to set up your AI phone assistant."
            />
          )}

          {/* ── Page content (dimmed if no voice access) ── */}
          <div className={!limitsLoading && !hasVoice ? 'pointer-events-none opacity-40 select-none' : undefined}>

          {/* ── Page intro ── */}
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm px-5 py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-heading font-bold text-neutral-900 text-base">Voice & Phone Setup</h1>
                <p className="text-sm text-neutral-500 mt-0.5 leading-relaxed max-w-lg">
                  Connect a phone number to your AI assistant. Customers call — the AI handles it 24/7 and only passes to a human when needed.
                </p>
              </div>
              {allDone && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full flex-shrink-0">
                  <CheckCircle2 size={13} /> Live &amp; active
                </span>
              )}
            </div>

            {/* Progress steps */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {[
                { label: 'Assistant built', done: isConfigured, loading: isAutoBuilding },
                { label: 'Voice configured', done: hasVoiceConfig },
                { label: 'Phone number active', done: hasPhone },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 flex-1 rounded-lg px-3 py-2.5 border text-xs font-medium transition-colors ${
                    step.done
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : step.loading
                        ? 'border-violet-200 bg-violet-50 text-violet-600'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                  }`}
                >
                  {step.loading ? (
                    <Loader2 size={13} className="animate-spin flex-shrink-0" />
                  ) : step.done ? (
                    <CheckCircle2 size={13} className="flex-shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center">
                      <span className="text-[9px] font-bold">{i + 1}</span>
                    </span>
                  )}
                  {step.loading ? 'Building assistant…' : step.label}
                </div>
              ))}
            </div>

            {isAutoBuilding && (
              <p className="text-xs text-neutral-400 mt-2">Setting up your AI assistant in the background — this takes about 10 seconds.</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 lg:gap-6">

            {/* ── Left column ── */}
            <div className="space-y-5 min-w-0">

              {/* ── Step 1: Voice Configuration ── */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="px-5 pt-5 pb-4 border-b border-neutral-50 flex items-start gap-3">
                  <StepBadge number={1} done={hasVoiceConfig} />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading font-bold text-neutral-900 text-sm">Configure Your AI Voice</h2>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Choose how your AI assistant sounds when customers call. Pick a voice provider, select a voice, set the language and tone — then save.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">

                  {/* Provider picker */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">Voice Provider</label>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3">Each provider has different voice styles. OpenAI and Deepgram are fastest; ElevenLabs gives the most natural, human-like voices.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {VAPI_VOICE_PROVIDERS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setVoiceProvider(p.id); setVoiceId(p.voices[0]?.id ?? '') }}
                          className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                            voiceProvider === p.id
                              ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-300'
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
                        <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1 block">
                          ElevenLabs Voice ID
                        </label>
                        <p className="text-xs text-neutral-400 mb-2 leading-relaxed">
                          Go to your <strong>ElevenLabs dashboard → Voices</strong>, copy the Voice ID of the voice you want, and paste it here.
                        </p>
                        <input
                          type="text"
                          placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                          value={voiceId}
                          onChange={(e) => setVoiceId(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1.5 block">Choose a Voice</label>
                        <p className="text-xs text-neutral-400 mb-3">Select the voice character for your AI assistant. Each has a different tone and gender.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {currentProvider.voices.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setVoiceId(v.id)}
                              className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                                voiceId === v.id
                                  ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-300'
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
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1 block">Language</label>
                    <p className="text-xs text-neutral-400 mb-2">Set the language your customers speak. The AI will respond in this language.</p>
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
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1 block">Conversation Tone</label>
                    <p className="text-xs text-neutral-400 mb-2">Controls how your AI speaks — formal and polished, or warm and conversational.</p>
                    <select
                      value={voiceTone}
                      onChange={(e) => setVoiceTone(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                    >
                      {VOICE_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {/* Save CTA */}
                  <div className="pt-1 border-t border-neutral-50">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={handleSaveAndRebuild}
                        disabled={savingVoice}
                        className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
                      >
                        {savingVoice ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Save & Rebuild Assistant
                      </button>
                      {hasVoiceConfig && (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                          <CheckCircle2 size={13} />
                          Saved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Saves your voice settings and rebuilds the AI assistant so changes take effect immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Step 2: Phone Number ── */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-neutral-50 flex items-start gap-3">
                  <StepBadge number={2} done={hasPhone} />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading font-bold text-neutral-900 text-sm">Get a Phone Number</h2>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Your AI assistant needs a dedicated phone number. Contact us and we&apos;ll provision one for you — usually within one business day.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <PhoneNumberManager />
                </div>
              </div>

              {/* ── Step 3: Test ── */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-neutral-50 flex items-start gap-3">
                  <StepBadge number={3} done={false} />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading font-bold text-neutral-900 text-sm">Test Your Voice Agent</h2>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Have a real conversation with your AI before going live. Use the browser call (free) or dial your number directly.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {!isConfigured ? (
                    /* Blocked state */
                    <div className="flex flex-col items-center py-8 gap-3 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                        <Mic size={22} className="text-neutral-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-600">Assistant not ready yet</p>
                        <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                          Complete Step 1 — save your voice settings to build the assistant — then you can test it here.
                        </p>
                      </div>
                      {isAutoBuilding && (
                        <div className="flex items-center gap-2 text-xs text-violet-600 font-medium">
                          <Loader2 size={13} className="animate-spin" />
                          Building now…
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Info strip */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5">
                        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                          <strong>Browser call</strong> — speak directly from this page (uses your microphone). Your <strong>first test is free</strong>, on us. After that, browser calls use 10 credits/min.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Browser call */}
                        <button
                          onClick={handleOpenModal}
                          disabled={callStatus === 'connecting' || callStatus === 'active'}
                          className="group relative flex flex-col items-center gap-3 bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-2xl px-5 py-6 hover:from-violet-700 hover:to-violet-600 transition-all shadow-lg shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {!freeTestUsed && (
                            <span className="absolute top-3 right-3 flex items-center gap-1 bg-green-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Gift size={9} /> FREE
                            </span>
                          )}
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <PhoneCall size={22} className="text-white" />
                          </div>
                          <div className="text-center">
                            <p className="font-heading font-bold text-sm">Browser Call</p>
                            <p className="text-white/70 text-xs mt-0.5">
                              {!freeTestUsed ? 'Your first call is free · 2 min' : '10 credits/min · 2 min max'}
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
                              <p className="text-neutral-400 text-xs mt-0.5">Complete Step 2 to get a number</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Assistant Status (collapsed detail) ── */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-neutral-900 text-sm">Assistant Status</h2>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    isConfigured ? 'bg-green-100 text-green-700' : isAutoBuilding ? 'bg-violet-100 text-violet-600' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {isConfigured
                      ? <><CheckCircle2 size={11} /> Active</>
                      : isAutoBuilding
                        ? <><Loader2 size={11} className="animate-spin" /> Building</>
                        : <>Not built</>
                    }
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-50">
                    <span className="text-xs text-neutral-500">Assistant ID</span>
                    {isConfigured ? (
                      <div className="flex items-center gap-1">
                        <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200 font-mono max-w-[160px] truncate block">
                          {company!.vapi_assistant_id}
                        </code>
                        <CopyButton value={company!.vapi_assistant_id!} />
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">{isAutoBuilding ? 'Building…' : 'Not created'}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-neutral-500">Phone Number</span>
                    {company?.vapi_phone_number ? (
                      <div className="flex items-center gap-1">
                        <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200 font-mono">
                          {company.vapi_phone_number}
                        </code>
                        <CopyButton value={company.vapi_phone_number} />
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Not assigned</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleRebuildOnly}
                    disabled={rebuilding || isAutoBuilding}
                    className="flex items-center gap-2 border border-neutral-200 text-neutral-700 px-4 py-2 rounded-full text-xs font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    {rebuilding ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    Rebuild Assistant
                  </button>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Use this if your AI personality changes and you want to sync the voice assistant.
                  </p>
                </div>
              </div>

            </div>

            {/* ── Right sidebar ── */}
            <div className="hidden lg:block space-y-4 lg:sticky lg:top-6 lg:self-start">

              {/* How it works */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Info size={13} className="text-violet-600" />
                  </div>
                  <p className="text-xs font-bold text-neutral-800 uppercase tracking-wide">How it works</p>
                </div>
                <ol className="space-y-4">
                  {[
                    { icon: <Zap size={13} />, title: 'Auto-setup', desc: 'Your AI assistant is built automatically when you first visit this page.' },
                    { icon: <Volume2 size={13} />, title: 'Configure voice', desc: 'Pick a voice, language, and tone that matches your brand.' },
                    { icon: <Phone size={13} />, title: 'Get a number', desc: 'Contact us to provision your dedicated business number.' },
                    { icon: <PhoneCall size={13} />, title: 'Go live', desc: 'Customers call your number — AI picks up instantly, 24/7.' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 text-violet-600 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">{item.title}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
                <p className="text-xs font-bold text-neutral-800 uppercase tracking-wide mb-4">Common Questions</p>
                <div className="space-y-4">
                  {[
                    { q: 'Do I need to be online for calls?', a: 'No. The AI handles all calls independently — even when your team is offline.' },
                    { q: 'What languages are supported?', a: 'English, French, Spanish, Yoruba, Hausa, and more. Select your language in Step 1.' },
                    { q: 'Can I use my existing number?', a: 'Yes — we can port your current number. Contact support for details.' },
                    { q: 'How much do calls cost?', a: 'Voice calls use 10 credits/min from your balance. Your first browser test is free.' },
                  ].map(({ q, a }) => (
                    <div key={q} className="border-b border-neutral-50 last:border-0 pb-3 last:pb-0">
                      <p className="text-[11px] font-semibold text-neutral-700 mb-1">{q}</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Number porting / contact */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-700 px-5 py-5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Headphones size={15} className="text-white" />
                  </div>
                  <p className="text-white font-heading font-bold text-sm leading-snug">Need help?</p>
                  <p className="text-white/60 text-xs mt-1 leading-relaxed">
                    Our team is available to set up your number, port an existing one, or help you troubleshoot.
                  </p>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <a
                    href="mailto:support@zentativ.com?subject=Voice+Setup+Help"
                    className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
                  >
                    <Mail size={12} /> Email Support
                  </a>
                  <a
                    href="/dashboard/settings"
                    className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-xs text-neutral-600 group-hover:text-neutral-900">Edit AI Personality</span>
                    <ChevronRight size={12} className="text-neutral-300 group-hover:text-violet-600 transition-colors" />
                  </a>
                  <a
                    href="/dashboard/tickets"
                    className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-xs text-neutral-600 group-hover:text-neutral-900">View Call Tickets</span>
                    <ChevronRight size={12} className="text-neutral-300 group-hover:text-violet-600 transition-colors" />
                  </a>
                  <a
                    href="/dashboard/analytics"
                    className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-xs text-neutral-600 group-hover:text-neutral-900">Voice Analytics</span>
                    <ChevronRight size={12} className="text-neutral-300 group-hover:text-violet-600 transition-colors" />
                  </a>
                </div>
              </div>

              {/* Credits reminder */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <Zap size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Voice uses credits</p>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      Each minute of an inbound call costs <strong>10 credits</strong>. Keep your balance topped up to avoid interruptions.
                    </p>
                    <a href="/dashboard/billing" className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 mt-2">
                      Top up credits <ChevronRight size={11} />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Mobile-only tips */}
          <div className="lg:hidden bg-blue-50 border border-blue-100 rounded-xl px-4 py-4">
            <div className="flex items-start gap-2.5">
              <MessageCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-800">Quick tips</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    'Save voice settings to activate your assistant.',
                    'Contact us to get your dedicated phone number.',
                    'Test with a free browser call before going live.',
                    'Voice calls cost 10 credits/min — keep balance topped up.',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-[11px] text-blue-700">
                      <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom padding */}
          <div className="h-4" />

          </div>{/* end plan-gated wrapper */}
        </div>
      </main>
    </div>
  )
}
