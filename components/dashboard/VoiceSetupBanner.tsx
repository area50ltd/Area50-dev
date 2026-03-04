'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, X } from 'lucide-react'
import { VoiceSetupDialog } from './VoiceSetupDialog'

const DISMISS_KEY = 'voice_banner_dismissed'

interface VapiStatus {
  configured: boolean
  phone_number: string | null
  assistant_id: string | null
}

async function fetchVapiStatus(): Promise<VapiStatus> {
  const res = await fetch('/api/vapi/status')
  if (!res.ok) throw new Error('Failed to fetch voice status')
  return res.json()
}

export function VoiceSetupBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
  }, [])

  const { data: status, isLoading } = useQuery({
    queryKey: ['vapi_status'],
    queryFn: fetchVapiStatus,
    staleTime: 30_000,
    retry: false,
  })

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  const handleSetupSuccess = () => {
    setDialogOpen(false)
    // Reload to hide banner and refresh company data
    window.location.reload()
  }

  if (isLoading || dismissed || status?.configured) return null

  return (
    <>
      <div className="flex items-center gap-4 bg-sky-50 border border-sky-200 rounded-xl px-5 py-4 mb-2">
        <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
          <Phone size={18} className="text-sky-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sky-900">Set up your AI phone line</p>
          <p className="text-xs text-sky-700 mt-0.5">
            Claim a phone number and enable voice support for your customers in minutes.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setDialogOpen(true)}
            className="text-xs font-semibold bg-sky-600 text-white px-4 py-1.5 rounded-full hover:bg-sky-700 transition-colors"
          >
            Set Up Voice
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full hover:bg-sky-100 transition-colors text-sky-500"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <VoiceSetupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSetupSuccess}
      />
    </>
  )
}
