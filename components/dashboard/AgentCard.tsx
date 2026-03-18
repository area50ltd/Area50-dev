'use client'

import { Bot, Edit, Trash2, Eye } from 'lucide-react'
import { AgentStatusDot } from '@/components/shared/StatusBadge'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import type { Agent, User } from '@/lib/types'

interface AgentCardProps {
  agent: Agent
  user: User | null
  onEdit?: () => void
  onRemove?: () => void
  onViewQueue?: () => void
}

export function AgentCard({ agent, user, onEdit, onRemove, onViewQueue }: AgentCardProps) {
  const name = user?.name ?? user?.email ?? 'Unknown Agent'
  const utilization = agent.max_concurrent_chats
    ? Math.round(((agent.active_chats ?? 0) / agent.max_concurrent_chats) * 100)
    : 0

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-center justify-center text-white text-sm font-heading font-bold">
              {getInitials(name)}
            </div>
            <AgentStatusDot
              status={agent.status ?? 'offline'}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" />
          </div>

          <div>
            <p className="font-semibold text-neutral-900 text-sm">{name}</p>
            <p className="text-neutral-400 text-xs">{user?.email}</p>
          </div>
        </div>

        {/* Status */}
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
          agent.status === 'online'
            ? 'bg-green-50 text-green-600'
            : agent.status === 'away'
            ? 'bg-yellow-50 text-yellow-600'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {agent.status ?? 'offline'}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="text-center bg-neutral-50 rounded-lg py-2">
          <p className="font-heading text-lg font-bold text-neutral-900">
            {agent.active_chats ?? 0}/{agent.max_concurrent_chats ?? 3}
          </p>
          <p className="text-neutral-400 text-[10px]">Active Chats</p>
        </div>
        <div className="text-center bg-neutral-50 rounded-lg py-2">
          <p className="font-heading text-lg font-bold text-neutral-900">
            {agent.total_resolved ?? 0}
          </p>
          <p className="text-neutral-400 text-[10px]">Resolved</p>
        </div>
        <div className="text-center bg-neutral-50 rounded-lg py-2">
          <p className="font-heading text-lg font-bold text-neutral-900">
            {agent.avg_response_time ?? 0}s
          </p>
          <p className="text-neutral-400 text-[10px]">Avg Response</p>
        </div>
      </div>

      {/* Utilization bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-neutral-400 mb-1">
          <span>Utilization</span>
          <span>{utilization}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              utilization >= 80 ? 'bg-red-400' : utilization >= 50 ? 'bg-yellow-400' : 'bg-green-400'
            }`}
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-neutral-50">
        <button
          onClick={onViewQueue}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
        >
          <Eye size={13} /> Queue
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
        >
          <Edit size={13} /> Edit
        </button>
        <button
          onClick={onRemove}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  )
}
