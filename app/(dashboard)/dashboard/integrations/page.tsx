'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  type LucideIcon,
  Search,
  Zap,
  MessageSquare,
  Github,
  Clock,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
  const Icon = integration.icon

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
        <span className="flex items-center gap-1 text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
          <Clock size={10} />
          Soon
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-sm text-neutral-900 mb-1">{integration.name}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{integration.description}</p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="w-full rounded-lg text-xs bg-neutral-100 text-neutral-400 hover:bg-neutral-100 cursor-not-allowed"
          disabled
        >
          <Clock size={12} className="mr-1.5" />
          Coming Soon
        </Button>
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
  const filtered = INTEGRATIONS.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All Apps' || i.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Integrations" />

      <main className="flex-1 p-6">

        {/* Coming Soon Banner */}
        <div className="mb-6 flex items-center justify-between gap-4 bg-violet-50 border border-violet-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">Integrations are coming soon</p>
              <p className="text-xs text-violet-600 mt-0.5">
                We&apos;re building native connections to your favourite tools. Get notified when they launch.
              </p>
            </div>
          </div>
          <a
            href={`mailto:support@zentativ.com?subject=${encodeURIComponent('Integrations Early Access')}&body=${encodeURIComponent('Hi,\n\nI\'d like to be notified when integrations are available on my Zentativ account.\n\nIntegrations I need most:\n- \n\nThanks')}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 border border-violet-300 bg-white px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Mail size={12} />
            Notify Me
          </a>
        </div>

        {/* Third-party integrations */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-700">App Marketplace</p>
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
                      ? 'bg-violet-600/10 text-violet-600 font-medium'
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
