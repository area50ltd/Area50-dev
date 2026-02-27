import { useQuery } from '@tanstack/react-query'

interface CreditsData {
  credits: number
  plan: string
}

async function fetchCredits(): Promise<CreditsData> {
  const res = await fetch('/api/credits')
  if (!res.ok) throw new Error('Failed to fetch credits')
  return res.json()
}

export function useCredits() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: fetchCredits,
    staleTime: 60_000,
  })
}
