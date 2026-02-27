import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Ticket } from '@/lib/types'

export interface TicketFilters {
  status?: string
  priority?: string
  assigned_to?: string
  search?: string
}

async function fetchTickets(filters: TicketFilters): Promise<Ticket[]> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.assigned_to) params.set('assigned_to', filters.assigned_to)
  if (filters.search) params.set('search', filters.search)

  const res = await fetch(`/api/tickets?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch tickets')
  return res.json()
}

export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => fetchTickets(filters),
    staleTime: 30_000,
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Ticket> }) => {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update ticket')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
