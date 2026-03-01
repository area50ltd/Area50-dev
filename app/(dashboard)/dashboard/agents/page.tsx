'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { AgentCard } from '@/components/dashboard/AgentCard'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { useAgents } from '@/hooks/useAgents'

export default function AgentsPage() {
  const [autoAssign, setAutoAssign] = useState(true)
  const { data: agentRows = [], isLoading } = useAgents()

  const onlineCount = agentRows.filter((r) => r.agent.status === 'online').length

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Human Agents" />

      <main className="flex-1 p-6 space-y-5">
        {/* Page controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Auto-assign toggle */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setAutoAssign(!autoAssign)
                  toast.success(`Auto-assign ${!autoAssign ? 'enabled' : 'disabled'}`)
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-600"
              >
                {autoAssign ? (
                  <ToggleRight size={22} className="text-[#E91E8C]" />
                ) : (
                  <ToggleLeft size={22} className="text-neutral-300" />
                )}
                Auto-assign tickets
              </button>
            </div>

            {/* Online count */}
            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {onlineCount} online · {agentRows.length} total
            </div>
          </div>

          <Button size="sm" className="rounded-full gap-2">
            <UserPlus size={15} /> Add Agent
          </Button>
        </div>

        {/* Agent cards grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : agentRows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No agents yet"
            description="Add human agents to handle escalated tickets. They'll appear here when they go online."
            action={{ label: 'Add First Agent', onClick: () => toast.info('Add agent form coming soon') }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agentRows.map(({ agent, user }) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                user={user}
                onEdit={() => toast.info('Edit agent coming soon')}
                onRemove={() => toast.error('Remove agent coming soon')}
                onViewQueue={() => toast.info('View agent queue coming soon')}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
