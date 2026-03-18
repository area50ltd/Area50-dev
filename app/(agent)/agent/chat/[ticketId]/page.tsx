'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, ArrowUpCircle, ArrowRight, StickyNote } from 'lucide-react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { MessageBubble } from '@/components/agent/MessageBubble'
import { ChatInput } from '@/components/agent/ChatInput'
import { SuggestionPanel } from '@/components/agent/SuggestionPanel'
import { CustomerInfoPanel } from '@/components/agent/CustomerInfoPanel'
import { StatusBadge, SentimentBadge } from '@/components/shared/StatusBadge'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { useTicket } from '@/hooks/useTicket'
import { useUpdateTicket } from '@/hooks/useTickets'
import { useRealtimeMessages } from '@/hooks/useRealtime'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function AgentChatPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data, isLoading } = useTicket(ticketId)
  const { mutate: updateTicket, isPending } = useUpdateTicket()
  const queryClient = useQueryClient()

  // Real-time: invalidate query instantly when widget customer sends a new message
  useRealtimeMessages(ticketId)
  const [suggestion, setSuggestion] = useState('')
  const [sending, setSending] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [fetchingSuggestion, setFetchingSuggestion] = useState(false)

  const handleFetchSuggestion = async (sessionId?: string) => {
    setFetchingSuggestion(true)
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          session_id: sessionId ?? ticketId,
          agent_message: suggestion || undefined,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Failed to get suggestion')
      setAiSuggestion(result.suggestion ?? '')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get AI suggestion')
    } finally {
      setFetchingSuggestion(false)
    }
  }

  const handleSend = async (message: string) => {
    if (!message.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to send')
      }
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleResolve = () => {
    updateTicket(
      { id: ticketId, data: { status: 'resolved' } },
      { onSuccess: () => toast.success('Ticket resolved!') }
    )
  }

  const handleEscalate = () => {
    updateTicket(
      { id: ticketId, data: { status: 'escalated', priority: 'urgent' } },
      { onSuccess: () => toast.info('Escalated to senior agent') }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <p>Ticket not found</p>
      </div>
    )
  }

  const { ticket, messages, customer, ticketCount } = data

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#1B2A4A] px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/agent/queue" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2.5">
          <p className="font-heading font-bold text-white text-sm">
            Ticket #{ticket.id.slice(0, 8)}
          </p>
          <StatusBadge value={ticket.status ?? 'open'} />
          {ticket.sentiment && <SentimentBadge value={ticket.sentiment} />}
        </div>
        <p className="text-white/40 text-xs ml-auto">{formatRelativeTime(ticket.created_at)}</p>
      </header>

      {/* Split view */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 overflow-hidden lg:h-[calc(100vh-56px)]">
        {/* Left — Chat (60%) */}
        <div className="lg:col-span-3 flex flex-col bg-white border-r border-neutral-200">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                No messages yet
              </div>
            )}
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            isSending={sending}
            customerPhone={null}
            suggestion={suggestion}
            onClearSuggestion={() => setSuggestion('')}
          />
        </div>

        {/* Right — Context panel (40%) */}
        <div className="lg:col-span-2 overflow-y-auto p-4 space-y-4 bg-neutral-50 scrollbar-thin">
          {/* Customer info */}
          <CustomerInfoPanel customer={customer} ticketCount={ticketCount} />

          {/* Ticket details */}
          <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
            <h4 className="font-heading text-xs font-bold text-[#1B2A4A] mb-3">Ticket Details</h4>
            <div className="space-y-2 text-xs">
              {[
                ['Channel', ticket.channel?.replace('_', ' ') ?? '—'],
                ['Category', ticket.category ?? '—'],
                ['Complexity', `${ticket.complexity_score ?? 0}/10`],
                ['Language', ticket.language?.toUpperCase() ?? 'EN'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-neutral-600">
                  <span className="text-neutral-400">{k}</span>
                  <span className="font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          {ticket.ai_summary && (
            <div className="bg-[#FDE7F3]/40 rounded-xl border border-[#E91E8C]/10 p-4">
              <h4 className="font-heading text-xs font-bold text-[#E91E8C] mb-2">AI Summary</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{ticket.ai_summary}</p>
            </div>
          )}

          {/* AI Suggestions */}
          <SuggestionPanel
            suggestions={aiSuggestion ? [aiSuggestion] : []}
            isLoading={fetchingSuggestion}
            onSelect={(s) => setSuggestion(s)}
            onRefresh={() => handleFetchSuggestion(ticket.session_id ?? ticketId)}
          />

          {/* Actions */}
          <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm space-y-2">
            <Button
              onClick={handleResolve}
              disabled={isPending}
              className="w-full rounded-lg gap-2 bg-green-500 hover:bg-green-600 text-xs"
              size="sm"
            >
              <CheckCircle2 size={13} /> Resolve
            </Button>
            <Button
              onClick={handleEscalate}
              disabled={isPending}
              variant="secondary"
              className="w-full rounded-lg gap-2 text-xs"
              size="sm"
            >
              <ArrowUpCircle size={13} /> Escalate
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-lg gap-2 text-xs text-neutral-500"
              size="sm"
            >
              <ArrowRight size={13} /> Transfer
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-lg gap-2 text-xs text-neutral-500"
              size="sm"
            >
              <StickyNote size={13} /> Add Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
