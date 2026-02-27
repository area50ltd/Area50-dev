import Link from 'next/link'
import { Globe, MessageCircle, Phone, Clock } from 'lucide-react'
import { PriorityBadge } from '@/components/shared/StatusBadge'
import { formatRelativeTime, truncate } from '@/lib/utils'
import type { Ticket } from '@/lib/types'

const ChannelIcon = ({ channel }: { channel: string | null }) => {
  if (channel === 'whatsapp') return <MessageCircle size={13} className="text-green-500" />
  if (channel === 'voice_inbound') return <Phone size={13} className="text-purple-500" />
  return <Globe size={13} className="text-blue-500" />
}

export function QueueItem({ ticket }: { ticket: Ticket }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4 hover:shadow-md hover:border-[#E91E8C]/20 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ChannelIcon channel={ticket.channel} />
          <span className="font-mono text-xs text-neutral-400">#{ticket.id.slice(0, 8)}</span>
        </div>
        <PriorityBadge value={ticket.priority ?? 'normal'} />
      </div>

      {ticket.category && (
        <p className="text-sm font-medium text-[#1B2A4A] mb-1">{ticket.category}</p>
      )}

      {ticket.ai_summary && (
        <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
          {truncate(ticket.ai_summary, 100)}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Clock size={11} />
          <span>{formatRelativeTime(ticket.created_at)}</span>
        </div>

        <Link href={`/agent/chat/${ticket.id}`}>
          <button className="px-4 py-1.5 rounded-full bg-[#E91E8C] text-white text-xs font-semibold hover:bg-[#c91878] transition-colors shadow-sm">
            Claim
          </button>
        </Link>
      </div>
    </div>
  )
}
