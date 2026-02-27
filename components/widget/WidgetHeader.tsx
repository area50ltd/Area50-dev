'use client'

import { X, Minus, PhoneOff } from 'lucide-react'

interface WidgetHeaderProps {
  companyName: string
  avatarUrl?: string | null
  color: string
  onClose: () => void
  onEndChat?: () => void
}

export function WidgetHeader({ companyName, avatarUrl, color, onClose, onEndChat }: WidgetHeaderProps) {
  return (
    <div
      className="px-4 py-3.5 flex items-center gap-3"
      style={{ backgroundColor: color }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={companyName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-heading font-bold text-sm">
              {companyName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {/* Online dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{companyName}</p>
        <p className="text-white/70 text-xs">Typically replies instantly</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {onEndChat && (
          <button
            onClick={onEndChat}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <PhoneOff size={13} />
          </button>
        )}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
