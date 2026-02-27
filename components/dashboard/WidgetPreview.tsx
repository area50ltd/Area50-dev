'use client'

import { X, ChevronDown } from 'lucide-react'

interface WidgetPreviewProps {
  color: string
  welcomeMessage: string
  avatarUrl?: string
  companyName?: string
}

export function WidgetPreview({ color, welcomeMessage, avatarUrl, companyName = 'Support' }: WidgetPreviewProps) {
  return (
    <div className="relative flex items-end justify-end" style={{ minHeight: 480 }}>
      {/* Widget */}
      <div
        className="w-80 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-white flex flex-col"
        style={{ height: 460 }}
      >
        {/* Header */}
        <div className="px-4 py-3.5 flex items-center gap-3" style={{ backgroundColor: color }}>
          <div
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              companyName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{companyName}</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-white/70 text-xs">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <ChevronDown size={16} />
            <X size={16} />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-neutral-50">
          {/* Welcome message bubble */}
          <div className="flex gap-2 items-end">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: color }}
            >
              {companyName.charAt(0).toUpperCase()}
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] shadow-sm border border-neutral-100">
              <p className="text-sm text-neutral-700 leading-relaxed">{welcomeMessage}</p>
            </div>
          </div>

          {/* Sample customer message */}
          <div className="flex justify-end">
            <div
              className="rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[80%] text-white text-sm"
              style={{ backgroundColor: color }}
            >
              Hi, I need help with my account
            </div>
          </div>

          {/* Sample AI reply */}
          <div className="flex gap-2 items-end">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: color }}
            >
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] shadow-sm border border-neutral-100">
              <p className="text-sm text-neutral-700 leading-relaxed">
                Of course! I&apos;m happy to help. Could you please describe the issue you&apos;re experiencing?
              </p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-neutral-100 bg-white">
          <div className="flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-200">
            <p className="flex-1 text-sm text-neutral-400">Type a message...</p>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: color }}
            >
              ↑
            </div>
          </div>
        </div>
      </div>

      {/* Launcher bubble */}
      <div className="absolute bottom-0 right-0 -mb-4 -mr-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl text-xl"
          style={{ backgroundColor: color }}
        >
          💬
        </div>
      </div>
    </div>
  )
}
