import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type AgentStatus = 'online' | 'away' | 'offline'

async function updateStatus(status: AgentStatus): Promise<void> {
  const res = await fetch('/api/agent/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update status')
}

export function useAgentStatus(initialStatus: AgentStatus = 'offline') {
  const [status, setStatus] = useState<AgentStatus>(initialStatus)
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: updateStatus,
    onSuccess: (_, newStatus) => {
      setStatus(newStatus)
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success(`Status set to ${newStatus}`)
    },
    onError: () => toast.error('Failed to update status'),
  })

  return { status, setStatus: mutate }
}
