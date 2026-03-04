'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  type LucideIcon,
  Search,
  CheckCircle2,
  Zap,
  MessageSquare,
  Github,
  Settings2,
  Phone,
  Mic,
  Globe,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// Vapi Voice Configuration
// ---------------------------------------------------------------------------

const VOICE_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ig', label: 'Igbo' },
  { value: 'ha', label: 'Hausa' },
]

const VOICE_ACCENTS = [
  { value: 'american', label: 'American' },
  { value: 'british', label: 'British' },
  { value: 'australian', label: 'Australian' },
  { value: 'nigerian', label: 'Nigerian' },
  { value: 'indian', label: 'Indian' },
  { value: 'french', label: 'French' },
  { value: 'spanish', label: 'Spanish' },
]

const VOICE_GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
]

const VOICE_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'empathetic', label: 'Empathetic' },
]

interface VapiConfig {
  vapi_assistant_id: string
  vapi_phone_number: string
  voice_language: string
  voice_accent: string
  voice_gender: string
  voice_tone: string
  elevenlabs_voice_id: string
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function VapiConfigCard() {
  const [config, setConfig] = useState<VapiConfig>({
    vapi_assistant_id: '',
    vapi_phone_number: '',
    voice_language: 'en',
    voice_accent: 'american',
    voice_gender: 'female',
    voice_tone: 'professional',
    elevenlabs_voice_id: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/company')
      .then((r) => r.json())
      .then((data) => {
        if (!data) return
        setConfig({
          vapi_assistant_id: data.vapi_assistant_id ?? '',
          vapi_phone_number: data.vapi_phone_number ?? '',
          voice_language: data.voice_language ?? 'en',
          voice_accent: data.voice_accent ?? 'american',
          voice_gender: data.voice_gender ?? 'female',
          voice_tone: data.voice_tone ?? 'professional',
          elevenlabs_voice_id: data.elevenlabs_voice_id ?? '',
        })
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_language: config.voice_language,
          voice_accent: config.voice_accent,
          voice_gender: config.voice_gender,
          voice_tone: config.voice_tone,
          elevenlabs_voice_id: config.elevenlabs_voice_id || null,
          vapi_assistant_id: config.vapi_assistant_id || null,
          vapi_phone_number: config.vapi_phone_number || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Voice settings saved')
    } catch {
      toast.error('Failed to save voice settings')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: keyof VapiConfig) => (val: string) =>
    setConfig((prev) => ({ ...prev, [key]: val }))

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#FDE7F3] flex items-center justify-center shrink-0">
          <Phone size={18} className="text-[#E91E8C]" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Voice & Call Settings</h2>
          <p className="text-xs text-neutral-500">Configure your AI voice assistant for inbound and outbound calls</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-neutral-400" />
        </div>
      ) : (
        <>
          {/* Voice Credentials */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Globe size={11} />
              Voice Configuration
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Voice Assistant ID</label>
                <Input
                  placeholder="e.g. asst_xxxxxxxxxxxxxxxx"
                  value={config.vapi_assistant_id}
                  onChange={(e) => set('vapi_assistant_id')(e.target.value)}
                  className="text-sm"
                />
                <p className="text-[11px] text-neutral-400">Auto-configured by Area50 when you set up voice</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Provisioned Phone Number</label>
                <Input
                  placeholder="e.g. +1 415 555 0100"
                  value={config.vapi_phone_number}
                  onChange={(e) => set('vapi_phone_number')(e.target.value)}
                  className="text-sm"
                />
                <p className="text-[11px] text-neutral-400">Inbound calls to this number go to your AI assistant</p>
              </div>
            </div>
          </div>

          {/* Voice Personality */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Mic size={11} />
              Voice Personality
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SelectField
                label="Language"
                value={config.voice_language}
                onChange={set('voice_language')}
                options={VOICE_LANGUAGES}
              />
              <SelectField
                label="Accent"
                value={config.voice_accent}
                onChange={set('voice_accent')}
                options={VOICE_ACCENTS}
              />
              <SelectField
                label="Gender"
                value={config.voice_gender}
                onChange={set('voice_gender')}
                options={VOICE_GENDERS}
              />
              <SelectField
                label="Tone"
                value={config.voice_tone}
                onChange={set('voice_tone')}
                options={VOICE_TONES}
              />
            </div>
          </div>

          {/* Custom Voice */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Custom Voice (Optional)
            </p>
            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-medium text-neutral-600">Voice ID</label>
              <Input
                placeholder="e.g. EXAVITQu4vr4xnSDxMaL"
                value={config.elevenlabs_voice_id}
                onChange={(e) => set('elevenlabs_voice_id')(e.target.value)}
                className="text-sm font-mono"
              />
              <p className="text-[11px] text-neutral-400">
                Leave blank to use the default AI voice. Enter a custom voice ID to use a specific voice for your brand.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-neutral-100">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg text-xs gap-2 bg-[#1B2A4A] hover:bg-[#243460]"
              size="sm"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Voice Settings'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Third-Party Integrations
// ---------------------------------------------------------------------------

const CATEGORIES = ['All Apps', 'Messaging', 'CRM', 'Productivity', 'Custom Webhooks']

interface Integration {
  id: string
  name: string
  description: string
  category: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  connected: boolean
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get instant ticket notifications and updates directly in your team channels.',
    category: 'Messaging',
    icon: MessageSquare,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link support tickets to pull requests, issues, and commits.',
    category: 'Productivity',
    icon: Github,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-800',
    connected: false,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Deploy AI agents to over 2 billion users. Handle queries directly in WhatsApp.',
    category: 'Messaging',
    icon: MessageSquare,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    connected: false,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Two-way sync for leads, contacts, and opportunities.',
    category: 'CRM',
    icon: Zap,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    connected: false,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect your marketing and sales pipelines. Auto-create deals from resolved tickets.',
    category: 'CRM',
    icon: Zap,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Unlock 5,000+ apps with multi-step workflows triggered by ticket events.',
    category: 'Productivity',
    icon: Zap,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    connected: false,
  },
]

function IntegrationCard({ integration }: { integration: Integration }) {
  const [connected, setConnected] = useState(integration.connected)
  const [loading, setLoading] = useState(false)
  const Icon = integration.icon

  const handleToggle = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setConnected((prev) => {
      const next = !prev
      toast.success(next ? `${integration.name} connected` : `${integration.name} disconnected`)
      return next
    })
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', integration.iconBg)}>
          <Icon size={24} className={integration.iconColor} />
        </div>
        {connected && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} />
            Connected
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-sm text-[#1B2A4A] mb-1">{integration.name}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{integration.description}</p>
      </div>

      <div className="flex gap-2">
        {connected ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 rounded-lg text-xs"
              onClick={() => toast.info('Configure coming soon')}
            >
              <Settings2 size={13} className="mr-1.5" />
              Configure
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleToggle}
              disabled={loading}
            >
              {loading ? '...' : 'Disconnect'}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="w-full rounded-lg text-xs"
            onClick={handleToggle}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Install Integration'}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Apps')
  const [tab, setTab] = useState<'marketplace' | 'connected'>('marketplace')

  const connectedCount = INTEGRATIONS.filter((i) => i.connected).length

  const filtered = INTEGRATIONS.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All Apps' || i.category === category
    const matchTab = tab === 'marketplace' || i.connected
    return matchSearch && matchCategory && matchTab
  })

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Integrations" />

      <main className="flex-1 p-6">
        {/* Vapi Voice Config — always visible at top */}
        <VapiConfigCard />

        {/* Third-party integrations */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('marketplace')}
              className={cn(
                'text-sm font-medium px-4 py-2 rounded-lg transition-all',
                tab === 'marketplace' ? 'bg-[#1B2A4A] text-white' : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              App Marketplace
            </button>
            <button
              onClick={() => setTab('connected')}
              className={cn(
                'text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-1.5',
                tab === 'connected' ? 'bg-[#1B2A4A] text-white' : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              Connected
              <span
                className={cn(
                  'text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center',
                  tab === 'connected' ? 'bg-white text-[#1B2A4A]' : 'bg-[#E91E8C] text-white'
                )}
              >
                {connectedCount}
              </span>
            </button>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search integrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-56 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Category sidebar */}
          <div className="w-44 shrink-0">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3 px-2">Categories</p>
            <nav className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'w-full text-left text-sm px-3 py-2 rounded-lg transition-all',
                    category === cat
                      ? 'bg-[#E91E8C]/10 text-[#E91E8C] font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Integration grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-neutral-400">
                <Zap size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No integrations found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
