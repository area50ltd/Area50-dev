'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { type LucideIcon, Search, CheckCircle2, Zap, MessageSquare, Github, Settings2, ExternalLink, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
  comingSoon?: boolean
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Seamlessly interact with agents directly in your team channels. Get instant ticket notifications and updates.',
    category: 'Messaging',
    icon: MessageSquare,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    connected: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Trigger agent actions on pull requests, issues, and commits. Link support tickets to code changes.',
    category: 'Productivity',
    icon: Github,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-800',
    connected: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Deploy AI agents to over 2 billion users. Handle customer queries directly in WhatsApp.',
    category: 'Messaging',
    icon: MessageSquare,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    connected: false,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Two-way sync for leads, contacts, and opportunities. Never miss a customer interaction.',
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
    description: 'Unlock 5,000+ apps. Create complex multi-step workflows triggered by ticket events.',
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

export default function IntegrationsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Apps')
  const [tab, setTab] = useState<'marketplace' | 'connected'>('marketplace')
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/company')
      .then((r) => r.json())
      .then((data) => setPhoneNumber(data?.vapi_phone_number ?? null))
      .catch(() => null)
  }, [])

  const connectedCount = INTEGRATIONS.filter((i) => i.connected).length

  const filtered = INTEGRATIONS.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All Apps' || i.category === category
    const matchTab = tab === 'marketplace' || i.connected
    return matchSearch && matchCategory && matchTab
  })

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Integrations" />

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab('marketplace')}
                className={cn(
                  'text-sm font-medium px-4 py-2 rounded-lg transition-all',
                  tab === 'marketplace' ? 'bg-[#1B2A4A] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                Marketplace
              </button>
              <button
                onClick={() => setTab('connected')}
                className={cn(
                  'text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-1.5',
                  tab === 'connected' ? 'bg-[#1B2A4A] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                Connected
                <span className={cn(
                  'text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center',
                  tab === 'connected' ? 'bg-white text-[#1B2A4A]' : 'bg-[#E91E8C] text-white'
                )}>
                  {connectedCount}
                </span>
              </button>
            </div>
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

        {/* Phone Number Section */}
        <div className="mb-6 bg-white rounded-xl border border-neutral-100 shadow-sm p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FDE7F3] flex items-center justify-center shrink-0">
              <Phone size={22} className="text-[#E91E8C]" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-[#1B2A4A]">Voice Phone Number</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Inbound calls to this number are handled by your Vapi AI voice assistant (WF7).
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-neutral-400 mb-1">Provisioned number</p>
            <p className="font-mono text-sm font-semibold text-[#1B2A4A]">
              {phoneNumber ?? <span className="text-neutral-400 font-normal text-xs">Not provisioned</span>}
            </p>
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

            <div className="mt-6 pt-5 border-t border-neutral-100">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3 px-2">Resources</p>
              <button
                className="w-full text-left text-sm px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5"
                onClick={() => toast.info('API docs coming soon')}
              >
                <ExternalLink size={13} />
                API Docs
              </button>
              <button
                className="w-full text-left text-sm px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5"
                onClick={() => toast.info('Webhook builder coming soon')}
              >
                <Zap size={13} />
                Custom Webhook
              </button>
            </div>
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
