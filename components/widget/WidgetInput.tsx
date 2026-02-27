'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'

interface WidgetInputProps {
  onSend: (message: string) => void
  isSending?: boolean
  disabled?: boolean
}

export function WidgetInput({ onSend, isSending, disabled }: WidgetInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isSending || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-neutral-100 bg-white px-3 py-2.5 flex items-end gap-2">
      <button className="text-neutral-300 hover:text-neutral-500 mb-1.5 transition-colors flex-shrink-0">
        <Paperclip size={16} />
      </button>

      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Connecting to agent...' : 'Type a message...'}
        rows={1}
        className="flex-1 resize-none text-sm outline-none text-neutral-700 placeholder:text-neutral-300 leading-relaxed max-h-20 scrollbar-thin disabled:opacity-50"
      />

      <button
        onClick={handleSend}
        disabled={!value.trim() || isSending || disabled}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 flex-shrink-0 mb-0.5"
        style={{ backgroundColor: '#E91E8C' }}
      >
        <Send size={14} />
      </button>
    </div>
  )
}
