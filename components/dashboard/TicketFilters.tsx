'use client'

import { cn } from '@/lib/utils'

const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Escalated', value: 'escalated' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
  { label: 'High Priority', value: 'high_priority' },
  { label: 'AI Assigned', value: 'ai' },
  { label: 'Human Assigned', value: 'human' },
]

interface TicketFiltersProps {
  activeFilter: string
  onFilterChange: (value: string) => void
}

export function TicketFilters({ activeFilter, onFilterChange }: TicketFiltersProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
            activeFilter === tab.value
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
