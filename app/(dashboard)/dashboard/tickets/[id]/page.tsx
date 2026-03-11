'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, Bot, User, MessageSquare, Globe, Phone, ChevronDown,
  ChevronUp, Download, CheckCircle2, ArrowUpCircle, RefreshCw,
  StickyNote, Mail, Ticket,
} from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { StatusBadge, PriorityBadge, SentimentBadge } from '@/components/shared/StatusBadge'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useTicket } from '@/hooks/useTicket'
import { useUpdateTicket } from '@/hooks/useTickets'
import { useRealtimeMessages } from '@/hooks/useRealtime'
import { formatDateTime, formatRelativeTime, getInitials } from '@/lib/utils'
import type { Message, User as UserType } from '@/lib/types'
import Link from 'next/link'

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isCustomer = message.sender_type === 'customer'
  const isAI = message.sender_type === 'ai'
  const isAgent = message.sender_type === 'agent'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isCustomer ? 'bg-neutral-900 text-white' : isAI ? 'bg-violet-50 text-violet-600' : 'bg-blue-100 text-blue-600'
      }`}>
        {isAI ? <Bot size={14} /> : isAgent ? <User size={14} /> : '#'}
      </div>

      <div className={`max-w-[75%] ${isCustomer ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Label */}
        <span className="text-[10px] font-medium text-neutral-400 px-1">
          {isAI ? 'AI Assistant' : isAgent ? 'Agent' : 'Customer'}
        </span>

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isCustomer
            ? 'bg-neutral-900 text-white rounded-tr-sm'
            : isAI
            ? 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
            : 'bg-blue-50 text-blue-900 rounded-tl-sm border border-blue-100'
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

// ─── Customer Card ─────────────────────────────────────────────────────────────

function CustomerCard({ customer, ticketCount }: { customer: UserType | null; ticketCount: number }) {
  const initials = customer?.name ? getInitials(customer.name) : '?'
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
      <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4">Customer</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-neutral-800 truncate">{customer?.name ?? 'Unknown'}</p>
          <p className="text-xs text-neutral-400 truncate">{customer?.role ?? 'customer'}</p>
        </div>
      </div>
      <div className="space-y-2 text-xs text-neutral-600">
        {customer?.email && (
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-neutral-400 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer?.phone && (
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-neutral-400 shrink-0" />
            <span>{customer.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-50 mt-2">
          <Ticket size={12} className="text-neutral-400 shrink-0" />
          <span className="text-neutral-500">
            <span className="font-semibold text-neutral-700">{ticketCount}</span> total ticket{ticketCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useTicket(id)
  const { mutate: updateTicket, isPending } = useUpdateTicket()
  const [summaryOpen, setSummaryOpen] = useState(false)

  // Real-time: refresh messages instantly when widget customer or agent sends
  useRealtimeMessages(id)

  if (isLoading) return <div className="flex flex-col flex-1"><TopBar title="Ticket Detail" /><PageLoader /></div>
  if (error || !data) return (
    <div className="flex flex-col flex-1">
      <TopBar title="Ticket Detail" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-500">Ticket not found</p>
      </div>
    </div>
  )

  const { ticket, messages, customer, ticketCount } = data

  const handleStatusChange = (status: string) => {
    updateTicket(
      { id: ticket.id, data: { status: status as typeof ticket.status } },
      {
        onSuccess: () => toast.success(`Status updated to ${status}`),
        onError: () => toast.error('Failed to update status'),
      }
    )
  }

  const handleEscalate = () => {
    handleStatusChange('escalated')
    toast.info('Ticket escalated to human agent queue')
  }

  const handleResolve = () => {
    handleStatusChange('resolved')
    toast.success('Ticket resolved!')
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Ticket Detail" />

      <main className="flex-1 p-6 overflow-hidden">
        {/* Back + header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/dashboard/tickets">
            <button className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="font-mono text-sm text-neutral-500">#{ticket.id.slice(0, 8)}</span>
          <StatusBadge value={ticket.status ?? 'open'} />
          <PriorityBadge value={ticket.priority ?? 'normal'} />
        </div>

        {/* Split layout */}
        <div className="grid lg:grid-cols-5 gap-5 h-[calc(100vh-220px)]">
          {/* Left — Chat history (60%) */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
              {ticket.channel === 'whatsapp' ? (
                <MessageSquare size={15} className="text-green-500" />
              ) : ticket.channel === 'voice_inbound' ? (
                <Phone size={15} className="text-purple-500" />
              ) : (
                <Globe size={15} className="text-blue-500" />
              )}
              <span className="text-sm font-medium text-neutral-600 capitalize">
                {ticket.channel?.replace('_', ' ') ?? 'Web Chat'}
              </span>
              <span className="text-neutral-300 mx-1">·</span>
              <span className="text-xs text-neutral-400">{messages.length} messages</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                  No messages yet
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right — Metadata panel (40%) */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
            {/* Customer info */}
            <CustomerCard customer={customer} ticketCount={ticketCount} />

            {/* Status & Priority */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4">Ticket Details</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Status</span>
                  <select
                    value={ticket.status ?? 'open'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isPending}
                    className="text-xs border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500 bg-white"
                  >
                    {['open', 'in_progress', 'escalated', 'resolved', 'closed'].map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Priority</span>
                  <select
                    value={ticket.priority ?? 'normal'}
                    onChange={(e) => updateTicket({ id: ticket.id, data: { priority: e.target.value as typeof ticket.priority } })}
                    className="text-xs border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500 bg-white"
                  >
                    {['low', 'normal', 'high', 'urgent'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Assigned To</span>
                  <span className="text-xs font-medium text-neutral-700 capitalize">{ticket.assigned_to ?? 'ai'}</span>
                </div>

                {ticket.complexity_score !== null && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Complexity</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (ticket.complexity_score ?? 0) >= 7 ? 'bg-red-100 text-red-600'
                        : (ticket.complexity_score ?? 0) >= 4 ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {ticket.complexity_score}/10
                    </span>
                  </div>
                )}

                {ticket.sentiment && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Sentiment</span>
                    <SentimentBadge value={ticket.sentiment} />
                  </div>
                )}

                {ticket.category && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Category</span>
                    <span className="text-xs text-neutral-700">{ticket.category}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Channel</span>
                  <span className="text-xs text-neutral-700 capitalize">{ticket.channel?.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Created</span>
                  <span className="text-xs text-neutral-400">{formatDateTime(ticket.created_at)}</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {ticket.ai_summary && (
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
                <button
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="w-full flex items-center justify-between text-sm font-heading font-bold text-neutral-900"
                >
                  <span className="flex items-center gap-2">
                    <Bot size={14} className="text-violet-600" /> AI Summary
                  </span>
                  {summaryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                <AnimatePresence>
                  {summaryOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-neutral-600 leading-relaxed mt-3"
                    >
                      {ticket.ai_summary}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 space-y-2">
              <h3 className="font-heading text-sm font-bold text-neutral-900 mb-3">Actions</h3>

              <Button
                onClick={handleResolve}
                disabled={isPending || ticket.is_resolved === true}
                className="w-full rounded-lg gap-2 bg-green-500 hover:bg-green-600"
                size="sm"
              >
                <CheckCircle2 size={14} /> Resolve Ticket
              </Button>

              <Button
                onClick={handleEscalate}
                disabled={isPending || ticket.status === 'escalated'}
                variant="secondary"
                className="w-full rounded-lg gap-2"
                size="sm"
              >
                <ArrowUpCircle size={14} /> Escalate to Human
              </Button>

              <Button
                variant="ghost"
                className="w-full rounded-lg gap-2 text-neutral-600"
                size="sm"
              >
                <StickyNote size={14} /> Add Note
              </Button>

              <Button
                variant="ghost"
                className="w-full rounded-lg gap-2 text-neutral-600"
                size="sm"
              >
                <Download size={14} /> Download Transcript
              </Button>

              <Button
                onClick={() => updateTicket({ id: ticket.id, data: { status: 'open' } })}
                disabled={ticket.status === 'open'}
                variant="ghost"
                className="w-full rounded-lg gap-2 text-neutral-600"
                size="sm"
              >
                <RefreshCw size={14} /> Reopen
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
