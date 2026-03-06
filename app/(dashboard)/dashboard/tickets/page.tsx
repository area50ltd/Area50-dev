'use client'

import { useState } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { TicketFilters } from '@/components/dashboard/TicketFilters'
import { TicketTable } from '@/components/dashboard/TicketTable'
import { useTickets, useCreateTicket } from '@/hooks/useTickets'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

type Channel = 'web_widget' | 'whatsapp' | 'voice_inbound'
type Priority = 'low' | 'normal' | 'high' | 'urgent'

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'web_widget', label: 'Web Widget' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'voice_inbound', label: 'Voice / Phone' },
]

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export default function TicketsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [channel, setChannel] = useState<Channel>('web_widget')
  const [priority, setPriority] = useState<Priority>('normal')
  const [category, setCategory] = useState('')

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

  const createTicket = useCreateTicket()

  const handleCreate = async () => {
    try {
      const ticket = await createTicket.mutateAsync({
        channel,
        priority,
        category: category.trim() || undefined,
      })
      toast.success('Ticket created')
      setShowCreate(false)
      setChannel('web_widget')
      setPriority('normal')
      setCategory('')
      router.push(`/dashboard/tickets/${ticket.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create ticket')
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Tickets" />

      <main className="flex-1 p-6 space-y-4">
        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button size="sm" className="rounded-full gap-2" onClick={() => setShowCreate(true)}>
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

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#FDE7F3] flex items-center justify-center">
                  <Plus size={18} className="text-[#E91E8C]" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#1B2A4A]">Create Ticket</h3>
                  <p className="text-xs text-neutral-400">Manually open a new support ticket</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as Channel)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm bg-white"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Priority</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPriority(p.value)}
                        className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                          priority === p.value
                            ? 'border-[#E91E8C] bg-[#FDE7F3] text-[#E91E8C]'
                            : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Category <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. Billing, Technical, Complaint"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-full"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-full gap-2"
                  onClick={handleCreate}
                  disabled={createTicket.isPending}
                >
                  {createTicket.isPending && <Loader2 size={14} className="animate-spin" />}
                  Create Ticket
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
