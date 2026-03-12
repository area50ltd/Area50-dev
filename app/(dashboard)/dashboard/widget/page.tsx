'use client'

import { useState, useEffect, useRef } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WidgetPreview } from '@/components/dashboard/WidgetPreview'
import { EmbedCodeBlock } from '@/components/dashboard/EmbedCodeBlock'
import { toast } from 'sonner'
import { Upload, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { useCompany, useUpdateCompany } from '@/hooks/useCompany'
import { useQueryClient } from '@tanstack/react-query'

const PRESET_COLORS = [
  '#7C3AED', '#E91E8C', '#3B82F6', '#10B981',
  '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4',
]

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
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Populate from real company data
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

  const ToggleButton = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
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

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Widget Customizer" />

      <main className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 max-w-5xl">
            {/* Left: controls */}
            <div className="space-y-6">
              {/* Appearance */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
                <h3 className="font-heading text-base font-bold text-neutral-900">Appearance</h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Brand Color</label>
                  <div className="flex items-center gap-3 flex-wrap">
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
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border border-neutral-200"
                      title="Custom color"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                  />
                  <p className="text-xs text-neutral-400 mt-1">To change your company name, update it in Settings → Company Profile.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Widget Avatar</label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: avatarUrl ? undefined : color }}
                    >
                      {avatarUrl ? (
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
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg gap-2"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploadingAvatar ? 'Uploading…' : 'Upload Avatar'}
                    </Button>
                    <p className="text-xs text-neutral-400">PNG or JPG, max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
                <h3 className="font-heading text-base font-bold text-neutral-900">Content</h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Welcome Message</label>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-violet-500 text-sm resize-none"
                    placeholder="Enter the message shown to customers when they open the widget"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
                <h3 className="font-heading text-base font-bold text-neutral-900">Features</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Ticket View</p>
                    <p className="text-xs text-neutral-400">Let customers track their support tickets</p>
                  </div>
                  <ToggleButton value={ticketViewEnabled} onChange={setTicketViewEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">File Uploads</p>
                    <p className="text-xs text-neutral-400">Allow customers to attach images and files</p>
                  </div>
                  <ToggleButton value={fileUploadsEnabled} onChange={setFileUploadsEnabled} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    AI→Human Handoff Threshold:{' '}
                    <strong className="text-violet-600">{handoffThreshold}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={handoffThreshold}
                    onChange={(e) => setHandoffThreshold(Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    Complexity score above which the AI suggests a human agent.
                  </p>
                </div>
              </div>

              {/* Embed Code */}
              {company?.id && (
                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4">
                  <h3 className="font-heading text-base font-bold text-neutral-900">Embed Code</h3>
                  <p className="text-sm text-neutral-500">
                    Add these two lines before the closing{' '}
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;/body&gt;</code>{' '}
                    tag on your website.
                  </p>
                  <EmbedCodeBlock companyId={company.id} />
                </div>
              )}

              <Button onClick={handleSave} disabled={saving} className="rounded-full px-6">
                {saving ? 'Saving...' : 'Save Widget Settings'}
              </Button>
            </div>

            {/* Right: live preview */}
            <div className="lg:sticky lg:top-6">
              <p className="text-sm font-medium text-neutral-500 mb-4">Live Preview</p>
              <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl p-6">
                <WidgetPreview
                  color={color}
                  welcomeMessage={welcomeMessage}
                  companyName={companyName}
                />
              </div>
              <p className="text-xs text-neutral-400 text-center mt-3">
                Preview updates in real-time as you change settings
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
