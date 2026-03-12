'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Bot,
  Clock,
  Shield,
  FileUp,
  CheckCircle2,
  Upload,
  X,
  Plus,
  Minus,
  Phone,
  VolumeX,
  Loader2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  companyName: string
  supportEmail: string
  language: string
  timezone: string
  aiPersonality: string
  welcomeMessage: string
  widgetColor: string
  widgetAvatar: string | null
  businessHoursStart: string
  businessHoursEnd: string
  afterHoursMode: 'ai_only' | 'voicemail' | 'offline'
  afterHoursMessage: string
  afterHoursAgentAvailable: boolean
  complexityThreshold: number
  keywordsEscalate: string[]
  maxAiAttempts: number
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  supportEmail: z.string().email('Enter a valid email address'),
  language: z.string().min(2),
  timezone: z.string().min(3),
})

const step2Schema = z.object({
  aiPersonality: z
    .string()
    .min(20, 'Please describe the AI personality in at least 20 characters')
    .max(500),
  welcomeMessage: z.string().min(5, 'Welcome message is too short'),
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
})

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Company', icon: Building2 },
  { label: 'AI & Widget', icon: Bot },
  { label: 'Hours', icon: Clock },
  { label: 'Escalation', icon: Shield },
  { label: 'Knowledge', icon: FileUp },
  { label: 'Launch', icon: CheckCircle2 },
]

const PRESET_COLORS = ['#7C3AED', '#0A0A10', '#3B82F6', '#10B981', '#F59E0B', '#E91E8C']

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'es', label: 'Spanish' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ig', label: 'Igbo' },
  { value: 'ha', label: 'Hausa' },
]

const TIMEZONE_GROUPS = [
  {
    group: 'Africa',
    options: [
      { value: 'Africa/Lagos', label: 'Lagos, Abuja (WAT +1)' },
      { value: 'Africa/Nairobi', label: 'Nairobi (EAT +3)' },
      { value: 'Africa/Cairo', label: 'Cairo (CAT +2)' },
      { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST +2)' },
      { value: 'Africa/Accra', label: 'Accra (GMT +0)' },
      { value: 'Africa/Casablanca', label: 'Casablanca (WET +0)' },
    ],
  },
  {
    group: 'Europe',
    options: [
      { value: 'Europe/London', label: 'London (GMT/BST)' },
      { value: 'Europe/Paris', label: 'Paris (CET +1)' },
      { value: 'Europe/Moscow', label: 'Moscow (MSK +3)' },
    ],
  },
  {
    group: 'Americas',
    options: [
      { value: 'America/New_York', label: 'New York (EST -5)' },
      { value: 'America/Chicago', label: 'Chicago (CST -6)' },
      { value: 'America/Los_Angeles', label: 'Los Angeles (PST -8)' },
      { value: 'America/Sao_Paulo', label: 'São Paulo (BRT -3)' },
    ],
  },
  {
    group: 'Asia & Pacific',
    options: [
      { value: 'Asia/Dubai', label: 'Dubai (GST +4)' },
      { value: 'Asia/Kolkata', label: 'Mumbai, Delhi (IST +5:30)' },
      { value: 'Asia/Singapore', label: 'Singapore (SGT +8)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST +9)' },
      { value: 'Australia/Sydney', label: 'Sydney (AEST +10)' },
    ],
  },
  {
    group: 'Other',
    options: [{ value: 'UTC', label: 'UTC (Coordinated Universal Time)' }],
  },
]

const ALL_TZ_OPTIONS = TIMEZONE_GROUPS.flatMap((g) => g.options)

const DEFAULT_KEYWORDS = ['refund', 'legal', 'lawsuit', 'fraud', 'cancel']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLocalTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date())
  } catch {
    return ''
  }
}

function timeToPct(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return ((h + m / 60) / 24) * 100
}

function complexityLabel(v: number): { text: string; color: string } {
  if (v <= 3) return { text: 'AI handles almost everything', color: 'text-green-600' }
  if (v <= 6) return { text: 'Balanced — recommended ✓', color: 'text-blue-600' }
  if (v <= 9) return { text: 'Humans handle most conversations', color: 'text-orange-600' }
  return { text: 'Always escalate to human', color: 'text-red-600' }
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-neutral-200">
          <motion.div
            className="h-full bg-violet-600"
            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1
          const done = stepNum < currentStep
          const active = stepNum === currentStep
          return (
            <div key={step.label} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  done
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : active
                    ? 'bg-white border-violet-600 text-violet-600'
                    : 'bg-white border-neutral-200 text-neutral-400'
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : <step.icon size={14} />}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? 'text-violet-600' : done ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step Container ───────────────────────────────────────────────────────────

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

// ─── Step 1: Company Profile ──────────────────────────────────────────────────

function Step1({
  data,
  setData,
  onNext,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
  onNext: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const localTime = getLocalTime(data.timezone)

  function handleNext() {
    const result = step1Schema.safeParse({
      companyName: data.companyName,
      supportEmail: data.supportEmail,
      language: data.language,
      timezone: data.timezone,
    })
    if (!result.success) {
      const errs: Record<string, string> = {}
      for (const e of result.error.errors) errs[e.path[0] as string] = e.message
      setErrors(errs)
      return
    }
    setErrors({})
    onNext()
  }

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-2">
        Tell us about your company
      </h2>
      <p className="text-neutral-500 mb-8">This sets up your Zentativ workspace.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
          <input
            value={data.companyName}
            onChange={(e) => setData((p) => ({ ...p, companyName: e.target.value }))}
            placeholder="e.g. Acme Corp"
            className="w-full h-11 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm"
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Support Email</label>
          <input
            value={data.supportEmail}
            onChange={(e) => setData((p) => ({ ...p, supportEmail: e.target.value }))}
            type="email"
            placeholder="support@yourcompany.com"
            className="w-full h-11 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm"
          />
          {errors.supportEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.supportEmail}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Language</label>
            <select
              value={data.language}
              onChange={(e) => setData((p) => ({ ...p, language: e.target.value }))}
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm bg-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Timezone</label>
            <select
              value={data.timezone}
              onChange={(e) => setData((p) => ({ ...p, timezone: e.target.value }))}
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm bg-white"
            >
              {TIMEZONE_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {localTime && (
              <p className="text-xs text-neutral-400 mt-1">
                Current time:{' '}
                <strong className="text-neutral-900">{localTime}</strong>
              </p>
            )}
          </div>
        </div>

        <Button size="lg" onClick={handleNext} className="w-full rounded-full mt-2">
          Continue <ArrowRight size={16} />
        </Button>
      </div>
    </StepContainer>
  )
}

// ─── Step 2: AI & Widget ──────────────────────────────────────────────────────

function Step2({
  data,
  setData,
  setAvatarFile,
  avatarPreview,
  setAvatarPreview,
  onNext,
  onBack,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
  setAvatarFile: (f: File | null) => void
  avatarPreview: string | null
  setAvatarPreview: (url: string | null) => void
  onNext: () => void
  onBack: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  function handleNext() {
    const result = step2Schema.safeParse({
      aiPersonality: data.aiPersonality,
      welcomeMessage: data.welcomeMessage,
      widgetColor: data.widgetColor,
    })
    if (!result.success) {
      const errs: Record<string, string> = {}
      for (const e of result.error.errors) errs[e.path[0] as string] = e.message
      setErrors(errs)
      return
    }
    setErrors({})
    onNext()
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) {
      toast.error('Only JPG, PNG, WebP, or GIF allowed')
      return
    }
    setAvatarFile(f)
    const url = URL.createObjectURL(f)
    setAvatarPreview(url)
  }

  function removeAvatar() {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-2">AI & Widget Setup</h2>
      <p className="text-neutral-500 mb-8">
        Define your AI&apos;s voice and customize your support widget.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: controls */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              AI Personality{' '}
              <span className="text-neutral-400 font-normal">
                ({data.aiPersonality.length}/500)
              </span>
            </label>
            <textarea
              value={data.aiPersonality}
              onChange={(e) =>
                setData((p) => ({ ...p, aiPersonality: e.target.value.slice(0, 500) }))
              }
              rows={5}
              placeholder={`e.g. "You are a friendly and professional support agent for Acme Corp. Always greet customers warmly, answer questions concisely, and escalate billing issues to human agents."`}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm resize-none leading-relaxed"
            />
            {errors.aiPersonality && (
              <p className="text-red-500 text-xs mt-1">{errors.aiPersonality}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Welcome Message
            </label>
            <textarea
              value={data.welcomeMessage}
              onChange={(e) => setData((p) => ({ ...p, welcomeMessage: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm resize-none"
            />
            {errors.welcomeMessage && (
              <p className="text-red-500 text-xs mt-1">{errors.welcomeMessage}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Widget Color</label>
            <div className="flex gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setData((p) => ({ ...p, widgetColor: c }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    data.widgetColor === c ? 'border-neutral-800 scale-110' : 'border-neutral-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              value={data.widgetColor}
              onChange={(e) => setData((p) => ({ ...p, widgetColor: e.target.value }))}
              placeholder="#7C3AED"
              className="w-32 h-9 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm font-mono"
            />
            {errors.widgetColor && (
              <p className="text-red-500 text-xs mt-1">{errors.widgetColor}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Widget Avatar{' '}
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              {avatarPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/30"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={9} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-200 flex items-center justify-center">
                  <span className="text-neutral-400 text-[10px]">Photo</span>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg text-xs"
              >
                {avatarPreview ? 'Change' : 'Upload Photo'}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP, GIF · Max 5MB</p>
          </div>
        </div>

        {/* Right: live preview */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Live Preview</label>
          <div className="bg-neutral-100 rounded-xl p-4 h-72 flex items-end justify-end">
            <div className="w-60 bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
              {/* Header */}
              <div className="px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: data.widgetColor }}>
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white/80" />
                  </div>
                )}
                <div>
                  <p className="text-white text-xs font-semibold">Support</p>
                  <p className="text-white/60 text-[10px]">We&apos;re online</p>
                </div>
              </div>
              {/* Chat area */}
              <div className="p-3 bg-neutral-50 min-h-[80px] flex flex-col justify-end">
                <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-neutral-700 shadow-sm self-start max-w-[90%]">
                  {data.welcomeMessage || 'Hello! How can I help?'}
                </div>
              </div>
              {/* Input bar */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-t border-neutral-100">
                <div className="flex-1 h-6 bg-neutral-100 rounded-full" />
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: data.widgetColor }}
                >
                  <ArrowRight size={10} className="text-white" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-400 text-center mt-2">Updates as you type</p>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" size="lg" onClick={onBack} className="rounded-full">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button size="lg" onClick={handleNext} className="flex-1 rounded-full">
          Continue <ArrowRight size={16} />
        </Button>
      </div>
    </StepContainer>
  )
}

// ─── Step 3: Business Hours ───────────────────────────────────────────────────

function Step3({
  data,
  setData,
  onNext,
  onBack,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
  onNext: () => void
  onBack: () => void
}) {
  const [timeError, setTimeError] = useState('')
  const startPct = timeToPct(data.businessHoursStart)
  const endPct = timeToPct(data.businessHoursEnd)

  function handleNext() {
    if (endPct <= startPct) {
      setTimeError('End time must be after start time')
      return
    }
    setTimeError('')
    onNext()
  }

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-2">Business Hours</h2>
      <p className="text-neutral-500 mb-8">
        Set when your team is available. Outside these hours, the AI handles coverage.
      </p>

      <div className="space-y-6">
        {/* Time inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Opens at</label>
            <input
              type="time"
              value={data.businessHoursStart}
              onChange={(e) => setData((p) => ({ ...p, businessHoursStart: e.target.value }))}
              className="w-full h-11 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Closes at</label>
            <input
              type="time"
              value={data.businessHoursEnd}
              onChange={(e) => setData((p) => ({ ...p, businessHoursEnd: e.target.value }))}
              className="w-full h-11 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm"
            />
          </div>
        </div>
        {timeError && <p className="text-red-500 text-xs -mt-3">{timeError}</p>}

        {/* Visual timeline */}
        <div>
          <p className="text-xs text-neutral-500 mb-1.5">Hours visualization</p>
          <div className="relative h-4 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-green-400 rounded-full transition-all duration-300"
              style={{
                left: `${Math.max(0, startPct)}%`,
                width: `${Math.max(0, endPct - startPct)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>

        {/* After-hours mode radio cards */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            After-Hours Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: 'ai_only', icon: Bot, label: 'AI Only', desc: 'AI keeps serving' },
                { value: 'voicemail', icon: Phone, label: 'Voicemail', desc: 'Take a message' },
                { value: 'offline', icon: VolumeX, label: 'Offline', desc: 'Show unavailable' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setData((p) => ({ ...p, afterHoursMode: mode.value }))}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                  data.afterHoursMode === mode.value
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <mode.icon
                  size={20}
                  className={
                    data.afterHoursMode === mode.value ? 'text-violet-600' : 'text-neutral-500'
                  }
                />
                <p
                  className={`text-sm font-semibold ${
                    data.afterHoursMode === mode.value ? 'text-violet-600' : 'text-neutral-900'
                  }`}
                >
                  {mode.label}
                </p>
                <p className="text-xs text-neutral-400 text-center">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* After-hours message (hidden when offline) */}
        {data.afterHoursMode !== 'offline' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              After-Hours Message
            </label>
            <textarea
              value={data.afterHoursMessage}
              onChange={(e) => setData((p) => ({ ...p, afterHoursMessage: e.target.value }))}
              rows={2}
              placeholder="e.g. Our team is offline. We'll respond first thing tomorrow morning."
              className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm resize-none"
            />
          </div>
        )}

        {/* Agent available toggle */}
        <div className="flex items-center justify-between py-3 px-4 border border-neutral-100 rounded-xl">
          <div>
            <p className="text-sm font-medium text-neutral-700">
              Allow agents to receive calls after hours
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Human agents can still be reached outside business hours
            </p>
          </div>
          <Switch
            checked={data.afterHoursAgentAvailable}
            onCheckedChange={(v) => setData((p) => ({ ...p, afterHoursAgentAvailable: v }))}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" onClick={onBack} className="rounded-full">
            <ArrowLeft size={16} /> Back
          </Button>
          <Button size="lg" onClick={handleNext} className="flex-1 rounded-full">
            Continue <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </StepContainer>
  )
}

// ─── Step 4: Escalation Rules ─────────────────────────────────────────────────

function Step4({
  data,
  setData,
  onNext,
  onBack,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
  onNext: () => void
  onBack: () => void
}) {
  const [keywordInput, setKeywordInput] = useState('')

  function addKeyword() {
    const kw = keywordInput.trim().toLowerCase()
    if (kw && !data.keywordsEscalate.includes(kw)) {
      setData((p) => ({ ...p, keywordsEscalate: [...p.keywordsEscalate, kw] }))
      setKeywordInput('')
    }
  }

  function removeKeyword(kw: string) {
    setData((p) => ({ ...p, keywordsEscalate: p.keywordsEscalate.filter((k) => k !== kw) }))
  }

  const { text: cLabel, color: cColor } = complexityLabel(data.complexityThreshold)

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-2">Escalation Rules</h2>
      <p className="text-neutral-500 mb-8">
        Define when and how tickets get escalated to human agents.
      </p>

      <div className="space-y-7">
        {/* Complexity slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-700">Complexity Threshold</label>
            <span className="text-2xl font-heading font-bold text-neutral-900">
              {data.complexityThreshold}
            </span>
          </div>
          <Slider
            value={[data.complexityThreshold]}
            onValueChange={([v]) => setData((p) => ({ ...p, complexityThreshold: v }))}
            min={1}
            max={10}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-neutral-400 mb-2">
            <span>1 (AI only)</span>
            <span>10 (Always human)</span>
          </div>
          <p className={`text-sm font-medium ${cColor}`}>{cLabel}</p>
        </div>

        {/* Keywords tag input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Escalation Keywords
          </label>
          <p className="text-xs text-neutral-400 mb-2">
            Tickets containing these keywords are automatically escalated to a human.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addKeyword()
                }
              }}
              placeholder="Type a keyword and press Enter"
              className="flex-1 h-10 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {data.keywordsEscalate.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.keywordsEscalate.map((kw) => (
                <Badge key={kw} variant="pink" className="flex items-center gap-1 cursor-default">
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="hover:text-red-600 ml-0.5"
                  >
                    <X size={11} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Max AI attempts stepper */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Max AI Attempts
          </label>
          <p className="text-xs text-neutral-400 mb-3">
            How many times should the AI try before escalating to a human?
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setData((p) => ({ ...p, maxAiAttempts: Math.max(1, p.maxAiAttempts - 1) }))
              }
              className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-heading font-bold text-2xl text-neutral-900 w-8 text-center">
              {data.maxAiAttempts}
            </span>
            <button
              type="button"
              onClick={() =>
                setData((p) => ({ ...p, maxAiAttempts: Math.min(10, p.maxAiAttempts + 1) }))
              }
              className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
            >
              <Plus size={16} />
            </button>
            <span className="text-sm text-neutral-500">attempts before escalating</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" onClick={onBack} className="rounded-full">
            <ArrowLeft size={16} /> Back
          </Button>
          <Button size="lg" onClick={onNext} className="flex-1 rounded-full">
            Continue <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </StepContainer>
  )
}

// ─── Step 5: Knowledge Base (optional) ───────────────────────────────────────

function Step5({
  onNext,
  onBack,
  setKbFile,
}: {
  onNext: () => void
  onBack: () => void
  setKbFile: (f: File | null) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setKbFile(f) }
  }

  function handleContinue() {
    onNext()
  }

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-2">
        Upload your first document
      </h2>
      <p className="text-neutral-500 mb-8">
        Your AI learns from it instantly. You can add more from the Knowledge Base section later.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-neutral-200 rounded-2xl p-10 text-center hover:border-violet-500/40 hover:bg-violet-50/30 transition-colors mb-6 cursor-pointer"
      >
        <Upload size={32} className="mx-auto mb-3 text-neutral-300" />
        <p className="font-medium text-neutral-700 mb-1">Drop a file here or click to browse</p>
        <p className="text-neutral-400 text-sm">PDF, TXT, CSV, DOCX, JSON · Max 50MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.csv,.docx,.json"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); setKbFile(f) }}
        />
      </div>

      {file && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-500/20 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-3">
            <FileUp size={18} className="text-violet-600" />
            <div>
              <p className="text-sm font-medium text-neutral-900">{file.name}</p>
              <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button onClick={() => { setFile(null); setKbFile(null) }} className="text-neutral-400 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="rounded-full">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onNext}
          className="rounded-full text-neutral-500"
        >
          Skip for now
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          className="flex-1 rounded-full"
        >
          {file ? 'Continue' : 'Continue'}
          <ArrowRight size={16} />
        </Button>
      </div>
    </StepContainer>
  )
}

// ─── Step 6: Review & Launch ──────────────────────────────────────────────────

function Step6({
  data,
  avatarPreview,
  onBack,
  onLaunch,
}: {
  data: FormData
  avatarPreview: string | null
  onBack: () => void
  onLaunch: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const LAUNCH_STEPS = [
    'Creating your workspace…',
    'Configuring your AI agent…',
    'Setting up routing rules…',
    'Saving widget settings…',
    'Finalising your account…',
  ]

  async function handleLaunch() {
    setLoading(true)
    setStepIndex(0)
    // Cycle through progress messages while the API call runs
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1 < LAUNCH_STEPS.length ? i + 1 : i))
    }, 1400)
    await onLaunch().catch(() => {
      clearInterval(interval)
      setLoading(false)
    })
    clearInterval(interval)
  }

  const langLabel = LANGUAGES.find((l) => l.value === data.language)?.label ?? data.language
  const tzLabel = ALL_TZ_OPTIONS.find((o) => o.value === data.timezone)?.label ?? data.timezone
  const { text: cLabel } = complexityLabel(data.complexityThreshold)
  const afterHoursLabel = { ai_only: 'AI Only', voicemail: 'Voicemail', offline: 'Offline' }[
    data.afterHoursMode
  ]

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070711] flex flex-col items-center justify-center">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex flex-col items-center gap-8 text-center px-8"
        >
          {/* Spinner ring */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
            <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-violet-600/10 flex items-center justify-center">
              <Bot size={26} className="text-violet-400" />
            </div>
          </div>

          {/* Brand */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">ZENTATIV</p>
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Setting up your account</h2>
            <p className="text-white/40 text-sm">This only takes a moment</p>
          </div>

          {/* Cycling step label */}
          <div className="h-7 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="text-violet-400 text-sm font-medium"
              >
                {LAUNCH_STEPS[stepIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {LAUNCH_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= stepIndex
                    ? 'bg-violet-500 w-6'
                    : 'bg-white/10 w-1.5'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-2">Review & Launch</h2>
      <p className="text-neutral-500 mb-8">
        Everything looks good? Hit launch to create your AI support system.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Company */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Company</p>
          <p className="text-sm font-semibold text-neutral-900">{data.companyName}</p>
          <p className="text-xs text-neutral-500">{data.supportEmail}</p>
          <p className="text-xs text-neutral-500">
            {langLabel} · {tzLabel.split('(')[0].trim()}
          </p>
        </div>

        {/* Widget */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Widget</p>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border border-neutral-200 flex-shrink-0"
              style={{ backgroundColor: data.widgetColor }}
            />
            <span className="text-xs font-mono text-neutral-600">{data.widgetColor}</span>
          </div>
          {avatarPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <p className="text-xs text-neutral-500 line-clamp-1">{data.welcomeMessage}</p>
        </div>

        {/* Business Hours */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Business Hours
          </p>
          <p className="text-sm font-semibold text-neutral-900">
            {data.businessHoursStart} – {data.businessHoursEnd}
          </p>
          <p className="text-xs text-neutral-500">After hours: {afterHoursLabel}</p>
          {data.afterHoursAgentAvailable && (
            <p className="text-xs text-green-600">✓ Agents available after hours</p>
          )}
        </div>

        {/* Escalation */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Escalation
          </p>
          <p className="text-sm font-semibold text-neutral-900">
            Threshold: {data.complexityThreshold}/10
          </p>
          <p className="text-xs text-neutral-500">{cLabel}</p>
          <p className="text-xs text-neutral-500">Max {data.maxAiAttempts} AI attempts</p>
          {data.keywordsEscalate.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {data.keywordsEscalate.slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full"
                >
                  {kw}
                </span>
              ))}
              {data.keywordsEscalate.length > 4 && (
                <span className="text-[10px] text-neutral-400">
                  +{data.keywordsEscalate.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={loading}
          className="rounded-full"
        >
          <ArrowLeft size={16} /> Back
        </Button>
        <Button
          size="lg"
          onClick={handleLaunch}
          disabled={loading}
          className="flex-1 rounded-full shadow-lg shadow-violet-600/25"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Setting up…</>
          ) : (
            'Launch My Account 🚀'
          )}
        </Button>
      </div>
    </StepContainer>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [kbFile, setKbFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    supportEmail: '',
    language: 'en',
    timezone: 'Africa/Lagos',
    aiPersonality: '',
    welcomeMessage: 'Hello! How can I help you today?',
    widgetColor: '#7C3AED',
    widgetAvatar: null,
    businessHoursStart: '08:00',
    businessHoursEnd: '18:00',
    afterHoursMode: 'ai_only',
    afterHoursMessage: '',
    afterHoursAgentAvailable: false,
    complexityThreshold: 6,
    keywordsEscalate: [...DEFAULT_KEYWORDS],
    maxAiAttempts: 3,
  })

  const next = () => setCurrentStep((s) => Math.min(s + 1, 6))
  const back = () => setCurrentStep((s) => Math.max(s - 1, 1))

  async function handleLaunch(): Promise<void> {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: formData.companyName,
        supportEmail: formData.supportEmail,
        language: formData.language,
        timezone: formData.timezone,
        aiPersonality: formData.aiPersonality || undefined,
        widgetColor: formData.widgetColor,
        welcomeMessage: formData.welcomeMessage,
        widgetAvatar: null,
        complexityThreshold: formData.complexityThreshold,
        keywordsEscalate: formData.keywordsEscalate,
        businessHoursStart: formData.businessHoursStart,
        businessHoursEnd: formData.businessHoursEnd,
        afterHoursMode: formData.afterHoursMode,
        afterHoursMessage: formData.afterHoursMessage || undefined,
        afterHoursAgentAvailable: formData.afterHoursAgentAvailable,
        maxAiAttempts: formData.maxAiAttempts,
      }),
    })

    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      // If we got redirected to login (307 → login HTML with 200), session was lost
      if (res.headers.get('content-type')?.includes('text/html')) {
        toast.error('Session expired. Redirecting to login...')
        window.location.href = '/login'
        return
      }
      const err = await res.json().catch(() => ({ error: 'Setup failed. Please try again.' }))
      toast.error(err.error ?? 'Setup failed. Please try again.')
      throw new Error('Onboarding failed')
    }

    // Upload avatar after company is created (getCurrentUser() now has company_id)
    if (avatarFile) {
      try {
        const fd = new FormData()
        fd.append('file', avatarFile)
        const avatarRes = await fetch('/api/settings/avatar', { method: 'POST', body: fd })
        if (!avatarRes.ok) {
          toast.warning('Avatar upload failed — you can set it later in Settings.')
        }
      } catch {
        toast.warning('Avatar upload failed — you can set it later in Settings.')
      }
    }

    // Upload KB document after company is created (getCurrentUser() now has company_id)
    if (kbFile) {
      try {
        const kbFd = new FormData()
        kbFd.append('file', kbFile)
        const kbRes = await fetch('/api/knowledge/upload', { method: 'POST', body: kbFd })
        if (!kbRes.ok) {
          toast.warning('Document upload failed — you can upload it later in the Knowledge Base section.')
        }
      } catch {
        toast.warning('Document upload failed — you can upload it later in the Knowledge Base section.')
      }
    }

    toast.success('Account created! Welcome to Zentativ.')
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10 overflow-hidden" style={{ height: '40px' }}>
          <Image
            src="/images/logo/logo-dark.png"
            alt="Zentativ"
            width={360}
            height={108}
            className="h-28 w-auto"
            priority
          />
        </div>

        <ProgressBar currentStep={currentStep} />

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 md:p-10">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1 key="s1" data={formData} setData={setFormData} onNext={next} />
            )}
            {currentStep === 2 && (
              <Step2
                key="s2"
                data={formData}
                setData={setFormData}
                setAvatarFile={setAvatarFile}
                avatarPreview={avatarPreview}
                setAvatarPreview={setAvatarPreview}
                onNext={next}
                onBack={back}
              />
            )}
            {currentStep === 3 && (
              <Step3
                key="s3"
                data={formData}
                setData={setFormData}
                onNext={next}
                onBack={back}
              />
            )}
            {currentStep === 4 && (
              <Step4
                key="s4"
                data={formData}
                setData={setFormData}
                onNext={next}
                onBack={back}
              />
            )}
            {currentStep === 5 && <Step5 key="s5" onNext={next} onBack={back} setKbFile={setKbFile} />}
            {currentStep === 6 && (
              <Step6
                key="s6"
                data={formData}
                avatarPreview={avatarPreview}
                onBack={back}
                onLaunch={handleLaunch}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
