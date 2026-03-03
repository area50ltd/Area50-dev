import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Company, RoutingRule } from '@/lib/types'

async function fetchCompany(): Promise<Company | null> {
  const res = await fetch('/api/company')
  if (!res.ok) throw new Error('Failed to fetch company')
  return res.json()
}

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: fetchCompany,
    staleTime: 60_000,
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const res = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save')
      }
      return res.json() as Promise<Company>
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['company'], updated)
    },
  })
}

async function fetchRoutingRules(): Promise<RoutingRule | null> {
  const res = await fetch('/api/settings/routing')
  if (!res.ok) throw new Error('Failed to fetch routing rules')
  return res.json()
}

export function useRoutingRules() {
  return useQuery({
    queryKey: ['routing_rules'],
    queryFn: fetchRoutingRules,
    staleTime: 60_000,
  })
}

export function useUpdateRoutingRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<RoutingRule>) => {
      const res = await fetch('/api/settings/routing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save routing rules')
      }
      return res.json() as Promise<RoutingRule>
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['routing_rules'], updated)
    },
  })
}
