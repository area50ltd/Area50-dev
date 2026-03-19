'use client'

import { useState, useEffect, useRef } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WidgetLivePreview } from '@/components/dashboard/WidgetLivePreview'
import { EmbedCodeBlock } from '@/components/dashboard/EmbedCodeBlock'
import { toast } from 'sonner'
import {
  Upload, ToggleLeft, ToggleRight, Loader2,
  Monitor, Smartphone, Palette, MessageSquare, Sliders, Code2,
} from 'lucide-react'
import { useCompany, useUpdateCompany } from '@/hooks/useCompany'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
  '#7C3AED', '#E91E8C', '#3B82F6', '#10B981',
  '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4',
]

type Tab = 'appearance' | 'content' | 'features' | 'embed'
type Device = 'desktop' | 'mobile'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'content',    label: 'Content',    icon: MessageSquare },
  { id: 'features',   label: 'Features',   icon: Sliders },
  { id: 'embed',      label: 'Embed',      icon: Code2 },
]

function ToggleButton({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 text-sm">
      {value ? (
        <ToggleRight size={28} className="text-violet-600" />
      ) : (
        <ToggleLeft size={28} className="text-neutral-300" />
      )}
      <span className={value ? 'text-violet-600 font-medium' : 'text-neutral-500'}>
        {value ? 'Enabled' : 'Disabled'}
      </span>
    </button>
  )
}

export default function WidgetCustomizerPage() {
  const { data: company, isLoading } = useCompany()
  const { mutate: updateCompany, isPending: saving } = useUpdateCompany()
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [color, setColor] = useState('#7C3AED')
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you today?')
  const [companyName, setCompanyName] = useState('My Company')
  const [ticketViewEnabled, setTicketViewEnabled] = useState(true)
  const [fileUploadsEnabled, setFileUploadsEnabled] = useState(true)
  const [handoffThreshold, setHandoffThreshold] = useState(6)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('appearance')
  const [device, setDevice] = useState<Device>('desktop')

  useEffect(() => {
    if (!company) return
    if (company.widget_color) setColor(company.widget_color)
    if (company.widget_welcome) setWelcomeMessage(company.widget_welcome)
    if (company.name) setCompanyName(company.name)
    if (company.widget_avatar) setAvatarUrl(company.widget_avatar)
  }, [company])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/settings/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setAvatarUrl(data.url)
      qc.invalidateQueries({ queryKey: ['company'] })
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    updateCompany(
      { widget_color: color, widget_welcome: welcomeMessage },
      {
        onSuccess: () => toast.success('Widget settings saved'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Chatbot Widget" />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row flex-1 min-h-0">

          {/* ── Left: settings panel ────────────────────────────────────── */}
          <div className="xl:w-[420px] xl:shrink-0 xl:border-r border-neutral-200 flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-neutral-200 bg-white sticky top-0 z-10">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium transition-colors',
                    activeTab === id
                      ? 'text-violet-600 border-b-2 border-violet-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* ── Appearance ── */}
              {activeTab === 'appearance' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Brand Color</label>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className="w-8 h-8 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: c,
                            borderColor: color === c ? '#7c3aed' : 'transparent',
                            transform: color === c ? 'scale(1.15)' : 'scale(1)',
                          }}
                        />
                      ))}
                      <div className="relative">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-8 h-8 rounded-full cursor-pointer border border-neutral-200 p-0 overflow-hidden"
                          title="Custom color"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-neutral-200" style={{ backgroundColor: color }} />
                      <span className="text-xs text-neutral-500 font-mono">{color.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company name"
                    />
                    <p className="text-xs text-neutral-400 mt-1">
                      Shown in the widget header. To change permanently, update in Settings → Company Profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Widget Avatar</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0 border-2 border-white shadow"
                        style={{ backgroundColor: avatarUrl ? undefined : color }}
                      >
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <div className="space-y-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-lg gap-2 h-8 text-xs"
                          disabled={uploadingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadingAvatar ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                          {uploadingAvatar ? 'Uploading…' : 'Upload Photo'}
                        </Button>
                        <p className="text-xs text-neutral-400">PNG or JPG, max 5MB</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Content ── */}
              {activeTab === 'content' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Welcome Message</label>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm resize-none"
                    placeholder="Enter the message shown to customers when they open the widget"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    This message appears in the chat window when a customer first opens the widget.
                    Keep it friendly and brief.
                  </p>
                </div>
              )}

              {/* ── Features ── */}
              {activeTab === 'features' && (
                <>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Ticket View</p>
                      <p className="text-xs text-neutral-400">Let customers track their support tickets</p>
                    </div>
                    <ToggleButton value={ticketViewEnabled} onChange={setTicketViewEnabled} />
                  </div>

                  <div className="border-t border-neutral-100" />

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-neutral-700">File Uploads</p>
                      <p className="text-xs text-neutral-400">Allow customers to attach images and files</p>
                    </div>
                    <ToggleButton value={fileUploadsEnabled} onChange={setFileUploadsEnabled} />
                  </div>

                  <div className="border-t border-neutral-100" />

                  <div className="py-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-neutral-700">AI → Human Handoff</label>
                      <span className="text-sm font-bold text-violet-600">{handoffThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={handoffThreshold}
                      onChange={(e) => setHandoffThreshold(Number(e.target.value))}
                      className="w-full accent-violet-600"
                    />
                    <div className="flex justify-between text-xs text-neutral-400 mt-1">
                      <span>1 (always AI)</span>
                      <span>10 (always human)</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1.5">
                      Complexity score above which the AI hands off to a human agent.
                    </p>
                  </div>
                </>
              )}

              {/* ── Embed ── */}
              {activeTab === 'embed' && (
                <>
                  {company?.id ? (
                    <>
                      <p className="text-sm text-neutral-500">
                        Add these two lines before the closing{' '}
                        <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;/body&gt;</code>{' '}
                        tag on your website.
                      </p>
                      <EmbedCodeBlock companyId={company.id} />
                    </>
                  ) : (
                    <p className="text-sm text-neutral-400">Loading company data…</p>
                  )}
                </>
              )}
            </div>

            {/* Save button */}
            <div className="p-5 border-t border-neutral-100 bg-white">
              <Button onClick={handleSave} disabled={saving} className="w-full rounded-full">
                {saving ? (
                  <><Loader2 size={14} className="animate-spin mr-2" />Saving…</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>

          {/* ── Right: live preview ──────────────────────────────────────── */}
          <div className="flex-1 flex flex-col bg-neutral-50">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-white">
              <div>
                <p className="text-sm font-semibold text-neutral-800">Live Preview</p>
                <p className="text-xs text-neutral-400">Changes update in real-time</p>
              </div>
              {/* Device toggle */}
              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setDevice('desktop')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    device === 'desktop'
                      ? 'bg-white text-neutral-800 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Monitor size={13} />
                  Desktop
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    device === 'mobile'
                      ? 'bg-white text-neutral-800 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Smartphone size={13} />
                  Mobile
                </button>
              </div>
            </div>

            {/* Preview canvas */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <WidgetLivePreview
                color={color}
                welcomeMessage={welcomeMessage}
                companyName={companyName}
                avatarUrl={avatarUrl}
                device={device}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
