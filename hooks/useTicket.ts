import { useQuery } from '@tanstack/react-query'
import type { Ticket, Message, User } from '@/lib/types'

interface TicketDetail {
  ticket: Ticket
  messages: Message[]
  customer: User | null
  ticketCount: number
}

async function fetchTicket(id: string): Promise<TicketDetail> {
  const res = await fetch(`/api/tickets/${id}`)
  if (!res.ok) throw new Error('Failed to fetch ticket')
  return res.json()
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicket(id),
    enabled: !!id,
    staleTime: 15_000,
    refetchInterval: 30_000, // fallback polling when realtime is unavailable
  })
}
