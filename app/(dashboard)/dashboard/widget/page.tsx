'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WidgetPreview } from '@/components/dashboard/WidgetPreview'
import { EmbedCodeBlock } from '@/components/dashboard/EmbedCodeBlock'
import { toast } from 'sonner'
import { Upload, ToggleLeft, ToggleRight } from 'lucide-react'

const PRESET_COLORS = [
  '#1B2A4A', '#E91E8C', '#3B82F6', '#10B981',
  '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4',
]

const DEMO_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

export default function WidgetCustomizerPage() {
  const [color, setColor] = useState('#1B2A4A')
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you today?')
  const [companyName, setCompanyName] = useState('My Company')
  const [ticketViewEnabled, setTicketViewEnabled] = useState(true)
  const [fileUploadsEnabled, setFileUploadsEnabled] = useState(true)
  const [handoffThreshold, setHandoffThreshold] = useState(6)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success('Widget settings saved')
  }

  const ToggleButton = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 text-sm">
      {value ? (
        <ToggleRight size={28} className="text-[#E91E8C]" />
      ) : (
        <ToggleLeft size={28} className="text-neutral-300" />
      )}
      <span className={value ? 'text-[#E91E8C] font-medium' : 'text-neutral-500'}>
        {value ? 'Enabled' : 'Disabled'}
      </span>
    </button>
  )

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Widget Customizer" />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-[1fr_360px] gap-8 max-w-5xl">
          {/* Left: controls */}
          <div className="space-y-6">
            {/* Appearance */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Appearance</h3>

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
                        borderColor: color === c ? '#E91E8C' : 'transparent',
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
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Widget Avatar</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: color }}
                  >
                    {companyName.charAt(0).toUpperCase()}
                  </div>
                  <Button variant="secondary" size="sm" className="rounded-lg gap-2">
                    <Upload size={14} />
                    Upload Avatar
                  </Button>
                  <p className="text-xs text-neutral-400">PNG or JPG, 256×256px recommended</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Content</h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Welcome Message</label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm resize-none"
                  placeholder="Enter the message shown to customers when they open the widget"
                />
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Features</h3>

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
                  <strong className="text-[#E91E8C]">{handoffThreshold}</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={handoffThreshold}
                  onChange={(e) => setHandoffThreshold(Number(e.target.value))}
                  className="w-full accent-[#E91E8C]"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Complexity score above which the AI suggests a human agent.
                </p>
              </div>
            </div>

            {/* Embed Code */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4">
              <h3 className="font-heading text-base font-bold text-[#1B2A4A]">Embed Code</h3>
              <p className="text-sm text-neutral-500">
                Add these two lines before the closing{' '}
                <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;/body&gt;</code>{' '}
                tag on your website.
              </p>
              <EmbedCodeBlock companyId={DEMO_COMPANY_ID} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="rounded-full px-6">
              {saving ? 'Saving...' : 'Save Widget Settings'}
            </Button>
          </div>

          {/* Right: live preview */}
          <div className="sticky top-6">
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
      </main>
    </div>
  )
}
