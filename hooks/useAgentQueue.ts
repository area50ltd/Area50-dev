import { useQuery } from '@tanstack/react-query'
import type { Ticket } from '@/lib/types'

async function fetchQueue(): Promise<Ticket[]> {
  const res = await fetch('/api/tickets?status=escalated&assigned_to=human')
  if (!res.ok) throw new Error('Failed to fetch queue')
  return res.json()
}

export function useAgentQueue() {
  return useQuery({
    queryKey: ['agent-queue'],
    queryFn: fetchQueue,
    refetchInterval: 15_000, // Poll every 15s for new tickets
    staleTime: 10_000,
  })
}
