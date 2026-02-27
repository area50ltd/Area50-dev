import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Agent, User } from '@/lib/types'

interface AgentWithUser {
  agent: Agent
  user: User | null
}

async function fetchAgents(): Promise<AgentWithUser[]> {
  const res = await fetch('/api/agents')
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
