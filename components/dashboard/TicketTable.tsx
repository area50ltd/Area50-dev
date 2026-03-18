'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MoreHorizontal, Globe, MessageCircle, Phone, Bot, User } from 'lucide-react'
import { StatusBadge, PriorityBadge, SentimentBadge } from '@/components/shared/StatusBadge'
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatRelativeTime, truncate } from '@/lib/utils'
import type { Ticket } from '@/lib/types'

const ChannelIcon = ({ channel }: { channel: string | null }) => {
  if (channel === 'whatsapp') return <MessageCircle size={14} className="text-green-500" />
  if (channel === 'voice_inbound') return <Phone size={14} className="text-purple-500" />
  return <Globe size={14} className="text-blue-500" />
}

interface TicketTableProps {
  tickets: Ticket[]
  isLoading: boolean
  onStatusChange?: (id: string, status: string) => void
}

export function TicketTable({ tickets, isLoading, onStatusChange }: TicketTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected(selected.size === tickets.length ? new Set() : new Set(tickets.map((t) => t.id)))

  return (
    <>
      {/* ── Mobile card list (< sm) ───────────────────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
          ))
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm py-14 text-center text-neutral-400 text-sm">
            No tickets found
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 active:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-mono text-xs text-neutral-400">#{ticket.id.slice(0, 8)}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge value={ticket.status ?? 'open'} />
                    <PriorityBadge value={ticket.priority ?? 'normal'} />
                  </div>
                </div>
                <p className="text-sm font-medium text-neutral-800 mb-1.5">
                  {ticket.category ?? 'General inquiry'}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <div className="flex items-center gap-1">
                    <ChannelIcon channel={ticket.channel} />
                    <span className="capitalize">{ticket.channel?.replace('_', ' ') ?? 'web'}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    {ticket.assigned_to === 'ai' ? <Bot size={12} className="text-violet-600" /> : <User size={12} className="text-blue-500" />}
                    <span className="capitalize">{ticket.assigned_to ?? 'ai'}</span>
                  </div>
                  <span>·</span>
                  <span>{formatRelativeTime(ticket.created_at)}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* ── Desktop table (sm+) ───────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-neutral-900 text-white px-5 py-2.5 flex items-center gap-4 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <button className="hover:underline text-white/80">Assign</button>
          <button className="hover:underline text-white/80">Close</button>
          <button className="hover:underline text-red-300">Delete</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-white/60 hover:text-white">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === tickets.length && tickets.length > 0}
                  onChange={toggleAll}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-600/20"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Channel</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Sentiment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Assigned</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Created</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={10} />)
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-neutral-400 text-sm">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-neutral-50/80 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(ticket.id)}
                      onChange={() => toggleSelect(ticket.id)}
                      className="rounded border-neutral-300 text-violet-600 focus:ring-violet-600/20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/tickets/${ticket.id}`} className="font-mono text-xs text-neutral-500 hover:text-violet-600">
                      #{ticket.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <ChannelIcon channel={ticket.channel} />
                      <span className="text-xs text-neutral-500 capitalize">
                        {ticket.channel?.replace('_', ' ') ?? 'web'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={ticket.status ?? 'open'} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge value={ticket.priority ?? 'normal'} />
                  </td>
                  <td className="px-4 py-3 text-neutral-600 text-xs">
                    {ticket.category ? truncate(ticket.category, 24) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      (ticket.complexity_score ?? 0) >= 7
                        ? 'bg-red-100 text-red-600'
                        : (ticket.complexity_score ?? 0) >= 4
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {ticket.complexity_score ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {ticket.sentiment ? (
                      <SentimentBadge value={ticket.sentiment} />
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {ticket.assigned_to === 'ai' ? (
                        <Bot size={13} className="text-violet-600" />
                      ) : (
                        <User size={13} className="text-blue-500" />
                      )}
                      <span className="text-xs text-neutral-600 capitalize">{ticket.assigned_to ?? 'ai'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {formatRelativeTime(ticket.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/tickets/${ticket.id}`}>
                      <button className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-all">
                        <MoreHorizontal size={15} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </>
  )
}
