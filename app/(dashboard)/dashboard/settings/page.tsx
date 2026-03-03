'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AlertTriangle, X, Plus, Phone, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompany, useUpdateCompany, useRoutingRules, useUpdateRoutingRules } from '@/hooks/useCompany'

const TABS = ['Company Profile', 'AI Personality', 'Notifications', 'Security', 'Voice Configuration', 'Human Agent Settings', 'Danger Zone']

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})
type ProfileValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const [tab, setTab] = useState('Company Profile')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: company, isLoading: companyLoading } = useCompany()
  const { data: routingRule, isLoading: routingLoading } = useRoutingRules()
  const { mutate: updateCompany, isPending: savingCompany } = useUpdateCompany()
  const { mutate: updateRouting, isPending: savingRouting } = useUpdateRoutingRules()

  // AI Personality
  const [aiPersonality, setAiPersonality] = useState('')
  useEffect(() => {
    if (company?.ai_personality) setAiPersonality(company.ai_personality)
  }, [company?.ai_personality])

  // Routing rules state — initialized from DB
  const [threshold, setThreshold] = useState(6)
  const [maxAiAttempts, setMaxAiAttempts] = useState(3)
  const [afterHoursMode, setAfterHoursMode] = useState('ai_only')
  const [afterHoursAvailable, setAfterHoursAvailable] = useState(false)
  const [afterHoursMessage, setAfterHoursMessage] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [hoursStart, setHoursStart] = useState('08:00')
  const [hoursEnd, setHoursEnd] = useState('18:00')
  const [timezone, setTimezone] = useState('Africa/Lagos')

  useEffect(() => {
    if (!routingRule) return
    if (routingRule.complexity_threshold) setThreshold(routingRule.complexity_threshold)
    if (routingRule.max_ai_attempts) setMaxAiAttempts(routingRule.max_ai_attempts)
    if (routingRule.after_hours_mode) setAfterHoursMode(routingRule.after_hours_mode)
    if (routingRule.after_hours_agent_available !== null) setAfterHoursAvailable(routingRule.after_hours_agent_available ?? false)
    if (routingRule.after_hours_message) setAfterHoursMessage(routingRule.after_hours_message)
    if (routingRule.keywords_escalate) setKeywords(routingRule.keywords_escalate)
    if (routingRule.business_hours_start) setHoursStart(routingRule.business_hours_start)
    if (routingRule.business_hours_end) setHoursEnd(routingRule.business_hours_end)
    if (routingRule.timezone) setTimezone(routingRule.timezone)
  }, [routingRule])

  // Voice config state
  const [voiceLang, setVoiceLang] = useState('en')
  const [voiceTone, setVoiceTone] = useState('professional')
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState('')
  const [rebuildingVoice, setRebuildingVoice] = useState(false)

  useEffect(() => {
    if (!company) return
    if (company.voice_language) setVoiceLang(company.voice_language)
    if (company.voice_tone) setVoiceTone(company.voice_tone)
    if (company.elevenlabs_voice_id) setElevenLabsVoiceId(company.elevenlabs_voice_id)
  }, [company])

  const { register, handleSubmit, formState: { errors }, reset: resetProfile } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  })

  // Populate profile form when company loads
  useEffect(() => {
    if (company) {
      resetProfile({ name: company.name ?? '', email: company.email ?? '' })
    }
  }, [company, resetProfile])

  const onSaveProfile = (values: ProfileValues) => {
    updateCompany(values, {
      onSuccess: () => toast.success('Profile saved'),
      onError: (err) => toast.error(err.message),
    })
  }

  const onSavePersonality = () => {
    updateCompany({ ai_personality: aiPersonality }, {
      onSuccess: () => toast.success('AI personality updated'),
      onError: (err) => toast.error(err.message),
    })
  }

  const addKeyword = () => {
    const kw = keywordInput.trim()
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw])
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => setKeywords((prev) => prev.filter((k) => k !== kw))

  const onSaveRouting = () => {
    updateRouting({
      complexity_threshold: threshold,
      max_ai_attempts: maxAiAttempts,
      after_hours_mode: afterHoursMode as 'ai_only' | 'voicemail' | 'offline',
      after_hours_agent_available: afterHoursAvailable,
      after_hours_message: afterHoursMessage,
      keywords_escalate: keywords,
      business_hours_start: hoursStart,
      business_hours_end: hoursEnd,
      timezone,
    }, {
      onSuccess: () => toast.success('Routing rules saved'),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleSaveVoice = async () => {
    setRebuildingVoice(true)
    try {
      await new Promise<void>((resolve, reject) =>
        updateCompany(
          { voice_language: voiceLang, voice_tone: voiceTone, elevenlabs_voice_id: elevenLabsVoiceId || null },
          { onSuccess: () => resolve(), onError: reject }
        )
      )
      const res = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_rebuild: true, voice_language: voiceLang, voice_tone: voiceTone, elevenlabs_voice_id: elevenLabsVoiceId }),
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

  const isLoading = companyLoading || routingLoading

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Settings" />

      <main className="flex-1 p-6">
        <div className="max-w-3xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
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

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-neutral-400" />
            </div>
          ) : (
            <>
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
                    <Button type="submit" size="sm" className="rounded-full" disabled={savingCompany}>
                      {savingCompany ? 'Saving...' : 'Save Changes'}
                    </Button>
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
                    placeholder="e.g. You are a friendly support assistant for Acme Corp. Always greet customers warmly..."
                  />
                  <Button onClick={onSavePersonality} size="sm" className="rounded-full" disabled={savingCompany}>
                    {savingCompany ? 'Saving...' : 'Save Personality'}
                  </Button>
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

              {/* Voice Configuration */}
              {tab === 'Voice Configuration' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-lg bg-[#FDE7F3] flex items-center justify-center">
                        <Phone size={18} className="text-[#E91E8C]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Voice Configuration</h3>
                        <p className="text-xs text-neutral-400">Powered by ElevenLabs TTS + Deepgram via Vapi</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Voice Language</label>
                      <select
                        value={voiceLang}
                        onChange={(e) => setVoiceLang(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm bg-white"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="yo">Yoruba</option>
                        <option value="ha">Hausa</option>
                        <option value="ig">Igbo</option>
                        <option value="ar">Arabic</option>
                        <option value="pt">Portuguese</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Voice Tone</label>
                      <select
                        value={voiceTone}
                        onChange={(e) => setVoiceTone(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm bg-white"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="formal">Formal</option>
                        <option value="empathetic">Empathetic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">ElevenLabs Voice ID</label>
                      <Input
                        placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                        value={elevenLabsVoiceId}
                        onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Paste your chosen voice ID from{' '}
                        <span className="text-[#E91E8C] font-medium">ElevenLabs Voice Library</span>.
                        Leave blank to use the default.
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveVoice}
                      disabled={rebuildingVoice}
                      size="sm"
                      className="rounded-full"
                    >
                      {rebuildingVoice ? 'Rebuilding assistant...' : 'Save & Rebuild Voice Assistant'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Human Agent Settings */}
              {tab === 'Human Agent Settings' && (
                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-6">
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

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Keywords to Escalate</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="e.g. refund, legal, urgent"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        className="flex-1 text-sm"
                      />
                      <Button variant="secondary" size="sm" onClick={addKeyword} className="rounded-lg">
                        <Plus size={15} />
                      </Button>
                    </div>
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map((kw) => (
                          <span key={kw} className="flex items-center gap-1 bg-[#FDE7F3] text-[#E91E8C] text-xs font-medium px-2.5 py-1 rounded-full">
                            {kw}
                            <button onClick={() => removeKeyword(kw)} className="ml-0.5 hover:text-red-600">
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 mt-1.5">Tickets containing these keywords are automatically escalated.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Max AI Attempts</label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1} max={10}
                        value={maxAiAttempts}
                        onChange={(e) => setMaxAiAttempts(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-xs text-neutral-400">attempts before escalating</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business Hours Start</label>
                      <Input type="time" value={hoursStart} onChange={(e) => setHoursStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business Hours End</label>
                      <Input type="time" value={hoursEnd} onChange={(e) => setHoursEnd(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm bg-white"
                    >
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Accra">Africa/Accra (GMT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">After Hours Mode</label>
                    <select
                      value={afterHoursMode}
                      onChange={(e) => setAfterHoursMode(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm bg-white"
                    >
                      <option value="ai_only">AI Only (continue serving customers)</option>
                      <option value="voicemail">Voicemail (take a message)</option>
                      <option value="offline">Offline (show unavailable message)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-neutral-100">
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Accept Calls Outside Business Hours</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Allow voice calls to connect to agents after hours</p>
                    </div>
                    <button
                      onClick={() => setAfterHoursAvailable((prev) => !prev)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors',
                        afterHoursAvailable ? 'bg-[#E91E8C]' : 'bg-neutral-200'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                        afterHoursAvailable ? 'left-5' : 'left-0.5'
                      )} />
                    </button>
                  </div>

                  {!afterHoursAvailable && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">After Hours Message</label>
                      <textarea
                        rows={3}
                        value={afterHoursMessage}
                        onChange={(e) => setAfterHoursMessage(e.target.value)}
                        placeholder="e.g. Our team is currently offline. We'll respond first thing in the morning."
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm resize-none"
                      />
                    </div>
                  )}

                  <Button size="sm" className="rounded-full" onClick={onSaveRouting} disabled={savingRouting}>
                    {savingRouting ? 'Saving...' : 'Save Rules'}
                  </Button>
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
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Organization"
        description="This will permanently delete all your data. This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
        onConfirm={() => { toast.error('Please contact support to delete your organization.'); setShowDeleteDialog(false) }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
