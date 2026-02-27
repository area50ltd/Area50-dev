'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { TicketFilters } from '@/components/dashboard/TicketFilters'
import { TicketTable } from '@/components/dashboard/TicketTable'
import { useTickets } from '@/hooks/useTickets'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function TicketsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Derive query params from active filter
  const getFilterParams = () => {
    if (activeFilter === 'all') return {}
    if (activeFilter === 'high_priority') return { priority: 'high' }
    if (activeFilter === 'ai') return { assigned_to: 'ai' }
    if (activeFilter === 'human') return { assigned_to: 'human' }
    return { status: activeFilter }
  }

  const { data: tickets = [], isLoading } = useTickets({
    ...getFilterParams(),
    search: search || undefined,
  })

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Tickets" />

      <main className="flex-1 p-6 space-y-4">
        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button size="sm" className="rounded-full gap-2">
            <Plus size={15} /> Create Ticket
          </Button>

          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="ml-auto text-xs text-neutral-400 font-medium">
            {isLoading ? 'Loading...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Filter tabs */}
        <TicketFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Table */}
        <TicketTable tickets={tickets} isLoading={isLoading} />
      </main>
    </div>
  )
}
