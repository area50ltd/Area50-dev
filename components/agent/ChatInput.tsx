'use client'

import { useState, useRef } from 'react'
import { Send, Phone } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  isSending?: boolean
  customerPhone?: string | null
  suggestion?: string
  onClearSuggestion?: () => void
}

export function ChatInput({ onSend, isSending, customerPhone, suggestion, onClearSuggestion }: ChatInputProps) {
  const [value, setValue] = useState(suggestion ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Apply suggestion when it changes
  if (suggestion && value !== suggestion) setValue(suggestion)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isSending) return
    onSend(trimmed)
    setValue('')
    onClearSuggestion?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-neutral-100 bg-white p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 transition-colors leading-relaxed scrollbar-thin"
          />
        </div>

        <div className="flex flex-col gap-2">
          {customerPhone && (
            <a href={`tel:${customerPhone}`} className="w-10 h-10 rounded-xl bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors">
              <Phone size={16} />
            </a>
          )}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-[#E91E8C] hover:bg-[#c91878] disabled:opacity-40 flex items-center justify-center text-white transition-colors shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <p className="text-[10px] text-neutral-300 mt-1.5">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
