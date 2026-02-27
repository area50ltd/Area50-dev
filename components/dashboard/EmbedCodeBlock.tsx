'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface EmbedCodeBlockProps {
  companyId: string
  appUrl?: string
}

export function EmbedCodeBlock({ companyId, appUrl = 'https://app.yourdomain.com' }: EmbedCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const code = `<!-- Area50 Support Widget -->
<script>window.AREA50_COMPANY_ID = '${companyId}';</script>
<script src="${appUrl}/embed.js" async></script>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Embed code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1B2A4A] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <span className="text-xs text-white/50 font-mono">HTML</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md text-xs"
        >
          {copied ? <Check size={13} className="mr-1.5 text-green-400" /> : <Copy size={13} className="mr-1.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="px-4 py-4 text-xs font-mono text-green-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  )
}
