'use client'

import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Ticket, UserCheck, Bot } from 'lucide-react'
import type { Message } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
  widgetColor: string
  onHelpful?: (id: string, helpful: boolean) => void
  onCreateTicket?: () => void
  onTalkToHuman?: () => void
}

export function MessageBubble({ message, widgetColor, onHelpful, onCreateTicket, onTalkToHuman }: MessageBubbleProps) {
  const isCustomer = message.sender_type === 'customer'
  const isAI = message.sender_type === 'ai'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* AI avatar */}
      {!isCustomer && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-neutral-100 mt-1">
          <Bot size={14} className="text-neutral-500" />
        </div>
      )}

      <div className={`max-w-[85%] flex flex-col gap-1 ${isCustomer ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isCustomer ? 'text-white rounded-tr-sm' : 'bg-white text-neutral-800 rounded-tl-sm shadow-sm border border-neutral-100'
          }`}
          style={isCustomer ? { backgroundColor: widgetColor } : {}}
        >
          {message.content}
        </div>

        {/* AI message actions */}
        {isAI && (
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={() => onHelpful?.(message.id, true)}
              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                message.is_helpful === true
                  ? 'bg-green-50 text-green-600'
                  : 'text-neutral-300 hover:text-green-500'
              }`}
            >
              <ThumbsUp size={10} /> Helpful
            </button>
            <button
              onClick={() => onHelpful?.(message.id, false)}
              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                message.is_helpful === false
                  ? 'bg-red-50 text-red-500'
                  : 'text-neutral-300 hover:text-red-400'
              }`}
            >
              <ThumbsDown size={10} />
            </button>
            <span className="text-neutral-200 text-[10px] mx-0.5">·</span>
            <button
              onClick={onCreateTicket}
              className="text-[10px] text-neutral-300 hover:text-blue-500 flex items-center gap-0.5 transition-colors"
            >
              <Ticket size={10} /> Ticket
            </button>
            <button
              onClick={onTalkToHuman}
              className="text-[10px] text-neutral-300 hover:text-[#E91E8C] flex items-center gap-0.5 transition-colors"
            >
              <UserCheck size={10} /> Human
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
