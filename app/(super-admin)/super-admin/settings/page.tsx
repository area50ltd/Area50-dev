'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Pencil, Save, Loader2, AlertTriangle, Cpu, Webhook, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o', desc: 'Best quality, higher cost' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Balanced quality & cost' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', desc: 'Fastest, most cost-efficient' },
]

const PAYSTACK_KEYS = [
  { key: 'paystack_secret_key', label: 'Secret Key', placeholder: 'sk_live_...' },
  { key: 'paystack_public_key', label: 'Public Key', placeholder: 'pk_live_...' },
  { key: 'paystack_webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_...' },
]

const N8N_KEYS = [
  { key: 'n8n_webhook_base_url', label: 'Webhook Base URL', placeholder: 'https://n8n.example.com', masked: false },
  { key: 'n8n_secret', label: 'Shared Secret', placeholder: 'area50_sk_...', masked: true },
]

const TWILIO_KEYS = [
  { key: 'twilio_account_sid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', masked: true },
  { key: 'twilio_auth_token', label: 'Auth Token', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', masked: true },
]

const EMAIL_KEYS = [
  { key: 'resend_api_key', label: 'Resend API Key', placeholder: 're_...', masked: true },
  { key: 'email_from_address', label: 'From Email Address', placeholder: 'notifications@zentativ.com', masked: false },
  { key: 'email_from_name', label: 'From Name', placeholder: 'Zentativ', masked: false },
]

type Settings = Record<string, string>

function MaskedField({
  label,
  settingKey,
  placeholder,
  currentMasked,
  onSave,
  saving,
}: {
  label: string
  settingKey: string
  placeholder: string
  currentMasked: string
  onSave: (key: string, value: string) => void
  saving: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <div className="flex gap-2">
        {editing ? (
          <>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-500 flex-1"
            />
            <Button
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => { onSave(settingKey, value); setEditing(false); setValue('') }}
              disabled={saving || !value}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </Button>
            <Button size="sm" variant="secondary" className="rounded-lg bg-neutral-700 text-white" onClick={() => { setEditing(false); setValue('') }}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Input
              value={currentMasked || 'Not set'}
              readOnly
              className="bg-neutral-700 border-neutral-600 text-neutral-400 flex-1 cursor-default"
            />
            <Button size="sm" variant="secondary" className="gap-1.5 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600" onClick={() => setEditing(true)}>
              <Pencil size={13} /> Edit
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function PlainField({
  label,
  settingKey,
  placeholder,
  currentValue,
  onSave,
  saving,
}: {
  label: string
  settingKey: string
  placeholder: string
  currentValue: string
  onSave: (key: string, value: string) => void
  saving: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentValue)

  useEffect(() => { setValue(currentValue) }, [currentValue])

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          readOnly={!editing}
          className={`flex-1 border-neutral-600 text-white placeholder:text-neutral-500 ${editing ? 'bg-neutral-700' : 'bg-neutral-800 cursor-default'}`}
        />
        {editing ? (
          <>
            <Button
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => { onSave(settingKey, value); setEditing(false) }}
              disabled={saving}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </Button>
            <Button size="sm" variant="secondary" className="rounded-lg bg-neutral-700 text-white" onClick={() => { setEditing(false); setValue(currentValue) }}>
              Cancel
            </Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" className="gap-1.5 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600" onClick={() => setEditing(true)}>
            <Pencil size={13} /> Edit
          </Button>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { data: settings = {}, isLoading } = useQuery<Settings>({
    queryKey: ['sa-settings'],
    queryFn: () => fetch('/api/super-admin/settings').then((r) => r.json()),
  })

  const saveSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      fetch('/api/super-admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      }).then((r) => r.json()),
    onSuccess: () => toast.success('Setting saved'),
    onError: () => toast.error('Failed to save setting'),
  })

  const handleSave = (key: string, value: string) => {
    saveSetting.mutate({ key, value })
  }

  const currentModel = settings['ai_model'] ?? 'gpt-4o'

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-neutral-800 rounded-xl animate-pulse border border-neutral-700" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* ─── Paystack ─── */}
      <section className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <span className="text-violet-600 font-bold text-sm">$</span>
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Paystack Integration</h2>
            <p className="text-xs text-neutral-500">API keys for payment processing</p>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 mb-5 flex items-start gap-2">
          <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-400">Keys are stored securely. Never share your secret key. Changes take effect immediately.</p>
        </div>

        <div className="space-y-4">
          {PAYSTACK_KEYS.map((field) => (
            <MaskedField
              key={field.key}
              label={field.label}
              settingKey={field.key}
              placeholder={field.placeholder}
              currentMasked={settings[field.key] ?? ''}
              onSave={handleSave}
              saving={saveSetting.isPending}
            />
          ))}
        </div>
      </section>

      {/* ─── n8n Config ─── */}
      <section className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Webhook size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">n8n Configuration</h2>
            <p className="text-xs text-neutral-500">Workflow automation server settings</p>
          </div>
        </div>

        <div className="space-y-4">
          {N8N_KEYS.map((field) =>
            field.masked ? (
              <MaskedField
                key={field.key}
                label={field.label}
                settingKey={field.key}
                placeholder={field.placeholder}
                currentMasked={settings[field.key] ?? ''}
                onSave={handleSave}
                saving={saveSetting.isPending}
              />
            ) : (
              <PlainField
                key={field.key}
                label={field.label}
                settingKey={field.key}
                placeholder={field.placeholder}
                currentValue={settings[field.key] ?? ''}
                onSave={handleSave}
                saving={saveSetting.isPending}
              />
            )
          )}
        </div>
      </section>

      {/* ─── Twilio ─── */}
      <section className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Phone size={16} className="text-red-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Twilio — Phone Numbers</h2>
            <p className="text-xs text-neutral-500">Credentials for purchasing & managing business phone numbers</p>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 mb-5 flex items-start gap-2">
          <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-400">These credentials are used for phone number search and purchase. Get them from <strong>console.twilio.com</strong> → Account Info.</p>
        </div>

        <div className="space-y-4">
          {TWILIO_KEYS.map((field) => (
            <MaskedField
              key={field.key}
              label={field.label}
              settingKey={field.key}
              placeholder={field.placeholder}
              currentMasked={settings[field.key] ?? ''}
              onSave={handleSave}
              saving={saveSetting.isPending}
            />
          ))}
        </div>
      </section>

      {/* ─── AI Model ─── */}
      <section className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Cpu size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">AI Model</h2>
            <p className="text-xs text-neutral-500">Model used for all AI chat responses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AI_MODELS.map((model) => (
            <button
              key={model.value}
              onClick={() => handleSave('ai_model', model.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentModel === model.value
                  ? 'border-violet-600 bg-violet-600/10'
                  : 'border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <p className={`font-semibold text-sm ${currentModel === model.value ? 'text-violet-600' : 'text-white'}`}>
                {model.label}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{model.desc}</p>
            </button>
          ))}
        </div>

        {saveSetting.isPending && (
          <p className="text-xs text-neutral-500 mt-3 flex items-center gap-1.5">
            <Loader2 size={11} className="animate-spin" /> Saving...
          </p>
        )}
      </section>

      {/* ─── Email / Notifications ─── */}
      <section className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Mail size={16} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Email & Notifications</h2>
            <p className="text-xs text-neutral-500">Resend API for transactional emails (escalations, low credits, digests)</p>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-3 mb-5 flex items-start gap-2">
          <Mail size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300">Get a free API key at <strong>resend.com</strong>. The from address must be a verified domain in your Resend account.</p>
        </div>

        <div className="space-y-4">
          {EMAIL_KEYS.map((field) =>
            field.masked ? (
              <MaskedField
                key={field.key}
                label={field.label}
                settingKey={field.key}
                placeholder={field.placeholder}
                currentMasked={settings[field.key] ?? ''}
                onSave={handleSave}
                saving={saveSetting.isPending}
              />
            ) : (
              <PlainField
                key={field.key}
                label={field.label}
                settingKey={field.key}
                placeholder={field.placeholder}
                currentValue={settings[field.key] ?? ''}
                onSave={handleSave}
                saving={saveSetting.isPending}
              />
            )
          )}
        </div>
      </section>
    </div>
  )
}
