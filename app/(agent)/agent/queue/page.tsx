'use client'

import Link from 'next/link'
import { LayoutGrid, Inbox, Clock, Users } from 'lucide-react'
import { AgentStatusToggle } from '@/components/agent/AgentStatusToggle'
import { QueueItem } from '@/components/agent/QueueItem'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAgentQueue } from '@/hooks/useAgentQueue'
import { useRealtimeQueue } from '@/hooks/useRealtime'

export default function AgentQueuePage() {
  const { data: queue = [], isLoading } = useAgentQueue()

  // Real-time: queue updates instantly when a ticket is escalated
  useRealtimeQueue()
  const urgent = queue.filter((t) => t.priority === 'urgent' || t.priority === 'high')
  const normal = queue.filter((t) => t.priority !== 'urgent' && t.priority !== 'high')

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-neutral-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
            <LayoutGrid size={18} />
          </Link>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xs">A</span>
            </div>
            <span className="font-heading font-bold text-white">Agent Console</span>
          </div>
        </div>

        <AgentStatusToggle />
      </header>

      <main className="p-6">
        {/* Queue stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Queue Depth', value: queue.length, icon: Inbox, color: 'text-blue-400' },
            { label: 'Urgent', value: urgent.length, icon: Clock, color: 'text-red-400' },
            { label: 'Avg Wait', value: '—', icon: Users, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <stat.icon size={15} className={stat.color} />
                <span className="text-xs text-white/50">{stat.label}</span>
              </div>
              <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Queue */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : queue.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Queue is empty"
            description="No tickets awaiting human attention. Set your status to Online to start receiving tickets."
          />
        ) : (
          <div className="space-y-4">
            {urgent.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> High Priority ({urgent.length})
                </h3>
                <div className="space-y-3">
                  {urgent.map((t) => <QueueItem key={t.id} ticket={t} />)}
                </div>
              </div>
            )}

            {normal.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Normal ({normal.length})
                </h3>
                <div className="space-y-3">
                  {normal.map((t) => <QueueItem key={t.id} ticket={t} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
