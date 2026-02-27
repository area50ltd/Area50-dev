'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = ['Company Profile', 'AI Personality', 'Notifications', 'Security', 'Human Agent Settings', 'Danger Zone']

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export default function SettingsPage() {
  const [tab, setTab] = useState('Company Profile')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [aiPersonality, setAiPersonality] = useState(
    'You are a professional and friendly support agent. Always greet customers warmly, answer questions concisely, and escalate billing issues to a human agent.'
  )
  const [threshold, setThreshold] = useState(6)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: 'My Company', email: 'support@mycompany.com' },
  })

  const onSaveProfile = () => toast.success('Profile saved')
  const onSavePersonality = () => toast.success('AI personality updated')

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Settings" />

      <main className="flex-1 p-6">
        <div className="max-w-3xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-thin">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
                  tab === t
                    ? 'bg-[#1B2A4A] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Company Profile */}
          {tab === 'Company Profile' && (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Company Profile</h3>
              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
                  <Input {...register('name')} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Support Email</label>
                  <Input {...register('email')} type="email" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <Button type="submit" size="sm" className="rounded-full">Save Changes</Button>
              </form>
            </div>
          )}

          {/* AI Personality */}
          {tab === 'AI Personality' && (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">AI Personality</h3>
              <p className="text-sm text-neutral-500">Define how your AI assistant communicates with customers.</p>
              <textarea
                value={aiPersonality}
                onChange={(e) => setAiPersonality(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm resize-none leading-relaxed"
              />
              <Button onClick={onSavePersonality} size="sm" className="rounded-full">Save Personality</Button>
            </div>
          )}

          {/* Notifications */}
          {tab === 'Notifications' && (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Notifications</h3>
              {[
                { label: 'Email on ticket escalation', defaultChecked: true },
                { label: 'Email on low credit balance', defaultChecked: true },
                { label: 'Weekly analytics digest', defaultChecked: false },
              ].map((n) => (
                <label key={n.label} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={n.defaultChecked} className="rounded border-neutral-300 text-[#E91E8C] focus:ring-[#E91E8C]/20" />
                  <span className="text-sm text-neutral-700">{n.label}</span>
                </label>
              ))}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Low Credit Threshold</label>
                <div className="flex items-center gap-3">
                  <Input type="number" defaultValue={500} className="w-28" />
                  <span className="text-sm text-neutral-400">credits</span>
                </div>
              </div>
              <Button size="sm" className="rounded-full" onClick={() => toast.success('Notifications saved')}>Save</Button>
            </div>
          )}

          {/* Security */}
          {tab === 'Security' && (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Security & API</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">API Key</label>
                <div className="flex gap-2">
                  <Input readOnly value="area50_sk_••••••••••••••••••••••••" className="font-mono" />
                  <Button variant="secondary" size="sm" onClick={() => toast.success('API key regenerated')} className="rounded-lg whitespace-nowrap">
                    Regenerate
                  </Button>
                </div>
                <p className="text-xs text-neutral-400 mt-1.5">Use this to authenticate API requests. Keep it secret.</p>
              </div>
            </div>
          )}

          {/* Human Agent Settings */}
          {tab === 'Human Agent Settings' && (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Routing Rules</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Complexity Threshold (1–10): <strong className="text-[#E91E8C]">{threshold}</strong>
                </label>
                <input
                  type="range" min={1} max={10} value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-[#E91E8C]"
                />
                <p className="text-xs text-neutral-400 mt-1">Tickets scoring above this are escalated to human agents.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business Hours Start</label>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business Hours End</label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Timezone</label>
                <select className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm bg-white">
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <Button size="sm" className="rounded-full" onClick={() => toast.success('Routing rules saved')}>Save Rules</Button>
            </div>
          )}

          {/* Danger Zone */}
          {tab === 'Danger Zone' && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="font-heading text-base font-bold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} /> Danger Zone
              </h3>
              <p className="text-sm text-red-600 mb-5">
                Permanently delete your organization, all tickets, agents, and knowledge base. This cannot be undone.
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
        </div>
      </main>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Organization"
        description="This will permanently delete all your data. This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
        onConfirm={() => { toast.error('Organization deleted (demo)'); setShowDeleteDialog(false) }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
