import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Message } from '@/lib/types'

export function MessageBubble({ message }: { message: Message }) {
  const isCustomer = message.sender_type === 'customer'
  const isAI = message.sender_type === 'ai'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isCustomer ? 'bg-[#1B2A4A] text-white' : isAI ? 'bg-[#FDE7F3] text-[#E91E8C]' : 'bg-blue-100 text-blue-600'
      }`}>
        {isAI ? <Bot size={13} /> : isCustomer ? <User size={13} /> : <User size={13} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[75%] ${isCustomer ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-medium text-neutral-400 px-1">
          {isAI ? 'AI' : isCustomer ? 'Customer' : 'You'}
        </span>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isCustomer
            ? 'bg-[#1B2A4A] text-white rounded-tr-sm'
            : isAI
            ? 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
            : 'bg-[#E91E8C] text-white rounded-tl-sm'
        }`}>
          {message.content}
        </div>
        <span className="text-[10px] text-neutral-300 px-1">
          {formatRelativeTime(message.created_at)}
        </span>
      </div>
    </motion.div>
  )
}
