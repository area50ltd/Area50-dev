'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Phone,
  Loader2,
  Copy,
  RefreshCw,
  PhoneCall,
} from 'lucide-react'
import { useCompany, useUpdateCompany } from '@/hooks/useCompany'
import { VOICE_LANGUAGES, VOICE_TONES } from '@/lib/constants'
import { VoiceSetupDialog } from '@/components/dashboard/VoiceSetupDialog'
import { TopBar } from '@/components/dashboard/TopBar'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handle}
      className="ml-2 p-1 rounded hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
      title="Copy"
    >
      {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VoiceSettingsPage() {
  const { data: company, isLoading } = useCompany()
  const updateCompany = useUpdateCompany()

  const [setupDialogOpen, setSetupDialogOpen] = useState(false)

  // Voice config form state
  const [voiceLanguage, setVoiceLanguage] = useState('')
  const [voiceTone, setVoiceTone] = useState('')
  const [elevenlabsId, setElevenlabsId] = useState('')
  const [savingVoice, setSavingVoice] = useState(false)

  // Populate form from company data when loaded
  const [hydrated, setHydrated] = useState(false)
  if (company && !hydrated) {
    setVoiceLanguage(company.voice_language ?? 'en-US')
    setVoiceTone(company.voice_tone ?? 'professional')
    setElevenlabsId(company.elevenlabs_voice_id ?? '')
    setHydrated(true)
  }

  // Test call state
  const [testPhone, setTestPhone] = useState('')
  const [callingTest, setCallingTest] = useState(false)

  // Rebuild only state
  const [rebuilding, setRebuilding] = useState(false)

  const handleSaveAndRebuild = async () => {
    setSavingVoice(true)
    try {
      await updateCompany.mutateAsync({
        voice_language: voiceLanguage,
        voice_tone: voiceTone,
        elevenlabs_voice_id: elevenlabsId || null,
      })
      const res = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_rebuild: true }),
      })
      if (!res.ok) throw new Error('Rebuild failed')
      toast.success('Voice settings saved and assistant rebuilt.')
    } catch {
      toast.error('Failed to save voice settings.')
    } finally {
      setSavingVoice(false)
    }
  }

  const handleTestCall = async () => {
    if (!testPhone.trim()) {
      toast.error('Enter a phone number to call.')
      return
    }
    setCallingTest(true)
    try {
      const res = await fetch('/api/vapi/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_phone: testPhone.trim(), ticket_id: '00000000-0000-0000-0000-000000000000' }),
      })
      if (!res.ok) throw new Error('Call failed')
      toast.success('Test call initiated! Check your phone.')
    } catch {
      toast.error('Failed to initiate test call.')
    } finally {
      setCallingTest(false)
    }
  }

  const handleRebuildOnly = async () => {
    setRebuilding(true)
    try {
      const res = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_rebuild: true }),
      })
      if (!res.ok) throw new Error('Rebuild failed')
      toast.success('Assistant rebuilt successfully.')
    } catch {
      toast.error('Failed to rebuild assistant.')
    } finally {
      setRebuilding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Voice Settings" credits={0} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </main>
      </div>
    )
  }

  const isConfigured = !!company?.vapi_assistant_id

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Voice Settings" credits={company?.credits ?? 0} />

      <main className="flex-1 p-6 max-w-2xl space-y-6">

        {/* ── Section 1: Phone Number Status ── */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h2 className="font-heading font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <Phone size={18} className="text-[#E91E8C]" />
            Phone Number Status
          </h2>

          {isConfigured ? (
            <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Active</p>
                <p className="text-xl font-heading font-bold text-[#1B2A4A] mt-0.5">
                  {company?.vapi_phone_number ?? '—'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-4">
              <Phone size={20} className="text-neutral-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-700">No phone number configured</p>
                <p className="text-xs text-neutral-400 mt-0.5">Set up voice to claim a number.</p>
              </div>
              <button
                onClick={() => setSetupDialogOpen(true)}
                className="text-xs font-semibold bg-[#E91E8C] text-white px-4 py-1.5 rounded-full hover:bg-[#c91878] transition-colors"
              >
                Set Up Voice
              </button>
            </div>
          )}
        </div>

        {/* ── Section 2: Voice Configuration ── */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h2 className="font-heading font-bold text-[#1B2A4A] mb-4">Voice Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                Voice Language
              </label>
              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C]"
              >
                {VOICE_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                Voice Tone
              </label>
              <select
                value={voiceTone}
                onChange={(e) => setVoiceTone(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C]"
              >
                {VOICE_TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                Custom Voice ID <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                value={elevenlabsId}
                onChange={(e) => setElevenlabsId(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C]"
              />
            </div>

            <button
              onClick={handleSaveAndRebuild}
              disabled={savingVoice}
              className="flex items-center gap-2 bg-[#E91E8C] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#c91878] transition-colors disabled:opacity-50"
            >
              {savingVoice ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Save & Rebuild Assistant
            </button>
          </div>
        </div>

        {/* ── Section 3: Test Your Voice Line ── */}
        {isConfigured && (
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h2 className="font-heading font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <PhoneCall size={18} className="text-[#E91E8C]" />
              Test Your Voice Line
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              Enter a phone number to receive a test call from your AI assistant.
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="+1 415 555 0100"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C]"
              />
              <button
                onClick={handleTestCall}
                disabled={callingTest}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1B2A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#243460] transition-colors disabled:opacity-50"
              >
                {callingTest ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
                Call
              </button>
            </div>
          </div>
        )}

        {/* ── Section 4: Assistant Status ── */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h2 className="font-heading font-bold text-[#1B2A4A] mb-4">Assistant Status</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 w-32 flex-shrink-0">Assistant ID</span>
              {company?.vapi_assistant_id ? (
                <div className="flex items-center min-w-0">
                  <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200 truncate max-w-xs">
                    {company.vapi_assistant_id}
                  </code>
                  <CopyButton value={company.vapi_assistant_id} />
                </div>
              ) : (
                <span className="text-xs text-neutral-400 italic">Not created yet</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 w-32 flex-shrink-0">Phone Number</span>
              {company?.vapi_phone_number ? (
                <div className="flex items-center">
                  <code className="text-xs text-neutral-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                    {company.vapi_phone_number}
                  </code>
                  <CopyButton value={company.vapi_phone_number} />
                </div>
              ) : (
                <span className="text-xs text-neutral-400 italic">Not assigned</span>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100">
            <button
              onClick={handleRebuildOnly}
              disabled={rebuilding}
              className="flex items-center gap-2 border border-neutral-200 text-neutral-700 px-5 py-2 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {rebuilding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Rebuild Assistant
            </button>
            <p className="text-xs text-neutral-400 mt-2">
              Sync the assistant with your latest AI personality and voice settings.
            </p>
          </div>
        </div>
      </main>

      <VoiceSetupDialog
        open={setupDialogOpen}
        onOpenChange={setSetupDialogOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
