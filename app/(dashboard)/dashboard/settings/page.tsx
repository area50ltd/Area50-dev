'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  AlertTriangle,
  X,
  Plus,
  Minus,
  Phone,
  VolumeX,
  Bot,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useCompany,
  useUpdateCompany,
  useRoutingRules,
  useUpdateRoutingRules,
} from '@/hooks/useCompany'

// ─── Tab list ─────────────────────────────────────────────────────────────────

const TABS = [
  'Company Profile',
  'Business Hours',
  'Escalation Rules',
  'Voice & Phone',
  'Notifications',
  'Danger Zone',
] as const

type Tab = (typeof TABS)[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRESET_COLORS = ['#7C3AED', '#E91E8C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

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

function complexityLabel(v: number): { text: string; color: string } {
  if (v <= 3) return { text: 'AI handles almost everything', color: 'text-green-600' }
  if (v <= 6) return { text: 'Balanced — recommended ✓', color: 'text-blue-600' }
  if (v <= 9) return { text: 'Humans handle most conversations', color: 'text-orange-600' }
  return { text: 'Always escalate to human', color: 'text-red-600' }
}

function timeToPct(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return ((h + m / 60) / 24) * 100
}

// ─── Profile schema ───────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  language: z.string(),
  ai_personality: z.string().max(500).optional(),
  widget_welcome: z.string().min(5, 'Welcome message too short'),
  widget_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
})
type ProfileValues = z.infer<typeof profileSchema>

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('Company Profile')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: company, isLoading: companyLoading } = useCompany()
  const { data: routingRule, isLoading: routingLoading } = useRoutingRules()
  const { mutate: updateCompany, isPending: savingCompany } = useUpdateCompany()
  const { mutate: updateRouting, isPending: savingRouting } = useUpdateRoutingRules()

  const isLoading = companyLoading || routingLoading

  // ── Company Profile form ───────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset: resetProfile,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      language: 'en',
      ai_personality: '',
      widget_welcome: 'Hello! How can I help you today?',
      widget_color: '#7C3AED',
    },
  })

  const watchedColor = watch('widget_color')
  const watchedWelcome = watch('widget_welcome')
  const watchedPersonality = watch('ai_personality') ?? ''

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (company) {
      resetProfile({
        name: company.name ?? '',
        email: company.email ?? '',
        language: company.language ?? 'en',
        ai_personality: company.ai_personality ?? '',
        widget_welcome: company.widget_welcome ?? 'Hello! How can I help you today?',
        widget_color: company.widget_color ?? '#7C3AED',
      })
      if (company.widget_avatar) setAvatarPreview(company.widget_avatar)
    }
  }, [company, resetProfile])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) {
      toast.error('Only JPG, PNG, WebP, or GIF allowed')
      return
    }
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', f)
      const res = await fetch('/api/settings/avatar', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json() as { url: string }
      setAvatarPreview(url)
      toast.success('Avatar updated')
    } catch {
      toast.error('Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function onSaveProfile(values: ProfileValues) {
    updateCompany(
      {
        name: values.name,
        email: values.email,
        language: values.language,
        ai_personality: values.ai_personality,
        widget_welcome: values.widget_welcome,
        widget_color: values.widget_color,
      },
      {
        onSuccess: () => toast.success('Profile saved'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  // ── Business Hours state ───────────────────────────────────────────────────
  const [hoursStart, setHoursStart] = useState('08:00')
  const [hoursEnd, setHoursEnd] = useState('18:00')
  const [timezone, setTimezone] = useState('Africa/Lagos')
  const [afterHoursMode, setAfterHoursMode] = useState<'ai_only' | 'voicemail' | 'offline'>('ai_only')
  const [afterHoursMessage, setAfterHoursMessage] = useState('')
  const [afterHoursAvailable, setAfterHoursAvailable] = useState(false)

  // ── Escalation state ───────────────────────────────────────────────────────
  const [threshold, setThreshold] = useState(6)
  const [maxAiAttempts, setMaxAiAttempts] = useState(3)
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])

  // ── Voice state ────────────────────────────────────────────────────────────
  const [voiceLang, setVoiceLang] = useState('en')
  const [voiceTone, setVoiceTone] = useState('professional')
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState('')
  const [rebuildingVoice, setRebuildingVoice] = useState(false)

  // ── Notification state ─────────────────────────────────────────────────────
  const [notifEmail, setNotifEmail] = useState('')
  const [notifyEscalation, setNotifyEscalation] = useState(true)
  const [notifyLowCredits, setNotifyLowCredits] = useState(true)
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false)
  const [lowCreditThreshold, setLowCreditThreshold] = useState(500)
  const [slackWebhook, setSlackWebhook] = useState('')

  // Populate routing + voice from DB
  useEffect(() => {
    if (!routingRule) return
    if (routingRule.complexity_threshold) setThreshold(routingRule.complexity_threshold)
    if (routingRule.max_ai_attempts) setMaxAiAttempts(routingRule.max_ai_attempts)
    if (routingRule.after_hours_mode) setAfterHoursMode(routingRule.after_hours_mode as 'ai_only' | 'voicemail' | 'offline')
    if (routingRule.after_hours_agent_available !== null)
      setAfterHoursAvailable(routingRule.after_hours_agent_available ?? false)
    if (routingRule.after_hours_message) setAfterHoursMessage(routingRule.after_hours_message)
    if (routingRule.keywords_escalate) setKeywords(routingRule.keywords_escalate)
    if (routingRule.business_hours_start) setHoursStart(routingRule.business_hours_start)
    if (routingRule.business_hours_end) setHoursEnd(routingRule.business_hours_end)
    if (routingRule.timezone) setTimezone(routingRule.timezone)
  }, [routingRule])

  useEffect(() => {
    if (!company) return
    if (company.voice_language) setVoiceLang(company.voice_language)
    if (company.voice_tone) setVoiceTone(company.voice_tone)
    if (company.elevenlabs_voice_id) setElevenLabsVoiceId(company.elevenlabs_voice_id)
    if (company.notification_email) setNotifEmail(company.notification_email)
    setNotifyEscalation(company.notify_email_escalation ?? true)
    setNotifyLowCredits(company.notify_email_low_credits ?? true)
    setNotifyWeeklyDigest(company.notify_weekly_digest ?? false)
    if (company.low_credit_threshold) setLowCreditThreshold(company.low_credit_threshold)
    if (company.slack_webhook_url) setSlackWebhook(company.slack_webhook_url)
  }, [company])

  function addKeyword() {
    const kw = keywordInput.trim().toLowerCase()
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw])
      setKeywordInput('')
    }
  }

  function onSaveBusinessHours() {
    if (timeToPct(hoursEnd) <= timeToPct(hoursStart)) {
      toast.error('End time must be after start time')
      return
    }
    updateRouting(
      {
        business_hours_start: hoursStart,
        business_hours_end: hoursEnd,
        timezone,
        after_hours_mode: afterHoursMode,
        after_hours_agent_available: afterHoursAvailable,
        after_hours_message: afterHoursMessage,
      },
      {
        onSuccess: () => toast.success('Business hours saved'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  function onSaveEscalation() {
    updateRouting(
      {
        complexity_threshold: threshold,
        max_ai_attempts: maxAiAttempts,
        keywords_escalate: keywords,
      },
      {
        onSuccess: () => toast.success('Escalation rules saved'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  async function handleSaveVoice() {
    setRebuildingVoice(true)
    try {
      await new Promise<void>((resolve, reject) =>
        updateCompany(
          {
            voice_language: voiceLang,
            voice_tone: voiceTone,
            elevenlabs_voice_id: elevenLabsVoiceId || null,
          },
          { onSuccess: () => resolve(), onError: reject }
        )
      )
      const res = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force_rebuild: true,
          voice_language: voiceLang,
          voice_tone: voiceTone,
          elevenlabs_voice_id: elevenLabsVoiceId,
        }),
      })
      if (res.ok) {
        toast.success('Voice assistant rebuilt successfully')
      } else {
        toast.error('Failed to rebuild voice assistant')
      }
    } catch {
      toast.error('Error saving voice configuration')
    } finally {
      setRebuildingVoice(false)
    }
  }

  function onSaveNotifications() {
    updateCompany(
      {
        notification_email: notifEmail || undefined,
        notify_email_escalation: notifyEscalation,
        notify_email_low_credits: notifyLowCredits,
        notify_weekly_digest: notifyWeeklyDigest,
        low_credit_threshold: lowCreditThreshold,
        slack_webhook_url: slackWebhook || undefined,
      },
      {
        onSuccess: () => toast.success('Notification settings saved'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const startPct = timeToPct(hoursStart)
  const endPct = timeToPct(hoursEnd)
  const { text: cLabel, color: cColor } = complexityLabel(threshold)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="Settings" />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar tab nav (desktop) ──────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-neutral-200 bg-white p-3 gap-0.5 overflow-y-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'w-full text-left px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all',
                t === 'Danger Zone'
                  ? tab === t
                    ? 'bg-red-50 text-red-700'
                    : 'text-red-500 hover:bg-red-50'
                  : tab === t
                    ? 'bg-violet-50 text-violet-700 border-l-2 border-violet-600 rounded-l-none'
                    : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              {t}
            </button>
          ))}
        </aside>

        {/* ── Mobile: sticky bottom tab bar ─────────────────────────────── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-neutral-200 flex gap-1 overflow-x-auto px-3 py-2 shadow-lg">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all',
                tab === t ? 'bg-neutral-900 text-white' : 'text-neutral-600 bg-neutral-100'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Content area ──────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-neutral-400" />
            </div>
          ) : (
            <>
              {/* ── Tab 1: Company Profile ─────────────────────────────────── */}
              {tab === 'Company Profile' && (
                <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-5">
                  <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
                    <h3 className="font-heading text-base font-bold text-neutral-900">
                      Company Profile
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Company Name
                        </label>
                        <Input {...register('name')} />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Support Email
                        </label>
                        <Input {...register('email')} type="email" />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Language
                      </label>
                      <select
                        {...register('language')}
                        className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm bg-white"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-neutral-400 mt-1">Timezone is managed in the Business Hours tab.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        AI Personality{' '}
                        <span className="text-neutral-400 font-normal">
                          ({watchedPersonality.length}/500)
                        </span>
                      </label>
                      <textarea
                        {...register('ai_personality')}
                        rows={4}
                        placeholder="e.g. You are a friendly support assistant for Acme Corp. Always greet customers warmly..."
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm resize-none leading-relaxed"
                        onChange={(e) => setValue('ai_personality', e.target.value.slice(0, 500))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Widget Welcome Message
                      </label>
                      <Input {...register('widget_welcome')} />
                      {errors.widget_welcome && (
                        <p className="text-red-500 text-xs mt-1">{errors.widget_welcome.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Widget Color
                      </label>
                      <div className="flex gap-2 mb-2">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setValue('widget_color', c)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              watchedColor === c
                                ? 'border-neutral-800 scale-110'
                                : 'border-neutral-200'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          {...register('widget_color')}
                          placeholder="#7C3AED"
                          className="w-32 font-mono text-sm"
                        />
                        {errors.widget_color && (
                          <p className="text-red-500 text-xs">{errors.widget_color.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Widget Avatar
                      </label>
                      <div className="flex items-center gap-4">
                        {avatarPreview ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatarPreview}
                              alt="Widget avatar"
                              className="w-14 h-14 rounded-full object-cover border-2 border-violet-500/30"
                            />
                            <button
                              type="button"
                              onClick={() => setAvatarPreview(null)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                            >
                              <X size={9} className="text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-200 flex items-center justify-center">
                            <span className="text-neutral-400 text-xs text-center leading-tight">
                              No avatar
                            </span>
                          </div>
                        )}
                        <div>
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => avatarFileRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="rounded-lg"
                          >
                            {uploadingAvatar ? 'Uploading...' : avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                          </Button>
                          <p className="text-xs text-neutral-400 mt-1">
                            JPG, PNG, WebP, GIF · Max 5MB
                          </p>
                        </div>
                        <input
                          ref={avatarFileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live widget preview */}
                  <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
                    <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4">
                      Widget Preview
                    </h3>
                    <div className="flex justify-center">
                      <div className="w-64 bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
                        <div
                          className="px-3 py-2.5 flex items-center gap-2"
                          style={{ backgroundColor: watchedColor }}
                        >
                          {avatarPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarPreview}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                              <Bot size={14} className="text-white/80" />
                            </div>
                          )}
                          <div>
                            <p className="text-white text-xs font-semibold">
                              {company?.name || 'Support'}
                            </p>
                            <p className="text-white/60 text-[10px]">We&apos;re online</p>
                          </div>
                        </div>
                        <div className="p-3 bg-neutral-50 min-h-[60px] flex flex-col justify-end">
                          <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-neutral-700 shadow-sm self-start max-w-[90%]">
                            {watchedWelcome || 'Hello! How can I help?'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="sm" className="rounded-full" disabled={savingCompany}>
                    {savingCompany ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              )}

              {/* ── Tab 2: Business Hours ──────────────────────────────────── */}
              {tab === 'Business Hours' && (
                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading text-base font-bold text-neutral-900">
                    Business Hours
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Opens at
                      </label>
                      <Input
                        type="time"
                        value={hoursStart}
                        onChange={(e) => setHoursStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Closes at
                      </label>
                      <Input
                        type="time"
                        value={hoursEnd}
                        onChange={(e) => setHoursEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
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

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm bg-white"
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
                          {
                            value: 'voicemail',
                            icon: Phone,
                            label: 'Voicemail',
                            desc: 'Take a message',
                          },
                          {
                            value: 'offline',
                            icon: VolumeX,
                            label: 'Offline',
                            desc: 'Show unavailable',
                          },
                        ] as const
                      ).map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => setAfterHoursMode(mode.value)}
                          className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                            afterHoursMode === mode.value
                              ? 'border-violet-600 bg-violet-50'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <mode.icon
                            size={20}
                            className={
                              afterHoursMode === mode.value
                                ? 'text-violet-600'
                                : 'text-neutral-500'
                            }
                          />
                          <p
                            className={`text-sm font-semibold ${
                              afterHoursMode === mode.value ? 'text-violet-600' : 'text-neutral-900'
                            }`}
                          >
                            {mode.label}
                          </p>
                          <p className="text-xs text-neutral-400 text-center">{mode.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {afterHoursMode !== 'offline' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        After-Hours Message
                      </label>
                      <textarea
                        rows={2}
                        value={afterHoursMessage}
                        onChange={(e) => setAfterHoursMessage(e.target.value)}
                        placeholder="e.g. Our team is offline. We'll respond first thing tomorrow morning."
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm resize-none"
                      />
                    </div>
                  )}

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
                      checked={afterHoursAvailable}
                      onCheckedChange={setAfterHoursAvailable}
                    />
                  </div>

                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={onSaveBusinessHours}
                    disabled={savingRouting}
                  >
                    {savingRouting ? 'Saving...' : 'Save Business Hours'}
                  </Button>
                </div>
              )}

              {/* ── Tab 3: Escalation Rules ────────────────────────────────── */}
              {tab === 'Escalation Rules' && (
                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-7">
                  <h3 className="font-heading text-base font-bold text-neutral-900">
                    Escalation Rules
                  </h3>

                  {/* Complexity slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-neutral-700">
                        Complexity Threshold
                      </label>
                      <span className="text-2xl font-heading font-bold text-neutral-900">
                        {threshold}
                      </span>
                    </div>
                    <Slider
                      value={[threshold]}
                      onValueChange={([v]) => setThreshold(v)}
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
                      <Input
                        placeholder="Type a keyword and press Enter"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addKeyword()
                          }
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={addKeyword}
                        className="rounded-lg"
                      >
                        <Plus size={15} />
                      </Button>
                    </div>
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="pink"
                            className="flex items-center gap-1 cursor-default"
                          >
                            {kw}
                            <button
                              onClick={() => setKeywords((prev) => prev.filter((k) => k !== kw))}
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
                        onClick={() => setMaxAiAttempts((v) => Math.max(1, v - 1))}
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-heading font-bold text-2xl text-neutral-900 w-8 text-center">
                        {maxAiAttempts}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMaxAiAttempts((v) => Math.min(10, v + 1))}
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <span className="text-sm text-neutral-500">attempts before escalating</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={onSaveEscalation}
                    disabled={savingRouting}
                  >
                    {savingRouting ? 'Saving...' : 'Save Escalation Rules'}
                  </Button>
                </div>
              )}

              {/* ── Tab 4: Voice & Phone ───────────────────────────────────── */}
              {tab === 'Voice & Phone' && (
                <div className="space-y-5">
                  {/* Voice System IDs (read-only) */}
                  <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-bold text-neutral-900">
                        Voice System
                      </h3>
                      <a
                        href="/dashboard/integrations"
                        className="flex items-center gap-1 text-xs text-violet-600 hover:underline"
                      >
                        Manage in Integrations <ExternalLink size={11} />
                      </a>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        Assistant ID
                      </label>
                      <Input
                        readOnly
                        value={company?.vapi_assistant_id ?? 'Not created yet'}
                        className="font-mono text-sm bg-neutral-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        Phone Number
                      </label>
                      <Input
                        readOnly
                        value={company?.vapi_phone_number ?? 'Not assigned yet'}
                        className="font-mono text-sm bg-neutral-50"
                      />
                    </div>
                  </div>

                  {/* Voice config */}
                  <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-neutral-900">
                          Voice Configuration
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Customise your AI assistant&apos;s voice and language
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Voice Language
                        </label>
                        <select
                          value={voiceLang}
                          onChange={(e) => setVoiceLang(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm bg-white"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Voice Tone
                        </label>
                        <select
                          value={voiceTone}
                          onChange={(e) => setVoiceTone(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm bg-white"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="formal">Formal</option>
                          <option value="empathetic">Empathetic</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Custom Voice ID
                      </label>
                      <Input
                        placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                        value={elevenLabsVoiceId}
                        onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Enter a custom voice ID to use a specific voice for your brand. Leave blank for
                        default.
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveVoice}
                      disabled={rebuildingVoice}
                      size="sm"
                      className="rounded-full"
                    >
                      {rebuildingVoice ? (
                        <>
                          <RefreshCw size={14} className="animate-spin mr-1" />
                          Rebuilding assistant...
                        </>
                      ) : (
                        'Save & Rebuild Voice Assistant'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Tab 5: Notifications ───────────────────────────────────── */}
              {tab === 'Notifications' && (
                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading text-base font-bold text-neutral-900">Notifications</h3>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Notification Email
                    </label>
                    <Input
                      type="email"
                      value={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.value)}
                      placeholder="alerts@yourcompany.com"
                    />
                    <p className="text-xs text-neutral-400 mt-1.5">
                      Receive alerts at this address. Leave blank to use your company email.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700 mb-1">Email Alerts</p>
                    {[
                      { label: 'Ticket escalation', desc: 'When a ticket is escalated to a human agent', value: notifyEscalation, onChange: setNotifyEscalation },
                      { label: 'Low credit balance', desc: `When credits fall below the threshold below`, value: notifyLowCredits, onChange: setNotifyLowCredits },
                      { label: 'Weekly analytics digest', desc: 'Summary of weekly ticket volume and resolution stats', value: notifyWeeklyDigest, onChange: setNotifyWeeklyDigest },
                    ].map((item) => (
                      <label key={item.label} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <Switch
                          checked={item.value}
                          onCheckedChange={item.onChange}
                          className="mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{item.label}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 pt-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Low Credit Alert Threshold
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min={100}
                          max={10000}
                          value={lowCreditThreshold}
                          onChange={(e) => setLowCreditThreshold(Number(e.target.value))}
                          className="w-28"
                        />
                        <span className="text-sm text-neutral-400">credits remaining</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Slack Webhook URL
                      </label>
                      <Input
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Post escalation alerts to a Slack channel.
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={onSaveNotifications}
                    disabled={savingCompany}
                  >
                    {savingCompany ? <><Loader2 size={13} className="animate-spin mr-1.5" />Saving...</> : 'Save Notifications'}
                  </Button>
                </div>
              )}

              {/* ── Tab 6: Danger Zone ─────────────────────────────────────── */}
              {tab === 'Danger Zone' && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h3 className="font-heading text-base font-bold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} /> Danger Zone
                  </h3>
                  <p className="text-sm text-red-600 mb-5">
                    Permanently delete your organization, all tickets, agents, knowledge base
                    documents, and billing history. This action{' '}
                    <strong>cannot be undone</strong>.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Organization
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Organization"
        description="This will permanently delete all your data. This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
        onConfirm={() => {
          toast.error('Please contact support to delete your organization.')
          setShowDeleteDialog(false)
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}

