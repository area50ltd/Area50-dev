import { useQuery } from '@tanstack/react-query'
import { getPlanLimits, withinLimit, type PlanLimits } from '@/lib/plan-limits'

interface PlanLimitsResponse {
  plan: string
  plan_status: string
  plan_expires_at: string | null
  limits: PlanLimits
  usage: {
    agents: number
    kb_docs: number
  }
}

export function usePlanLimits() {
  const { data, isLoading } = useQuery<PlanLimitsResponse>({
    queryKey: ['plan-limits'],
    queryFn: async () => {
      const res = await fetch('/api/plan-limits')
      if (!res.ok) throw new Error('Failed to fetch plan limits')
      return res.json()
    },
    staleTime: 60_000,
  })

  // Fallback to hardcoded limits while loading
  const limits: PlanLimits = data?.limits ?? getPlanLimits(data?.plan ?? 'starter')
  const usage = data?.usage ?? { agents: 0, kb_docs: 0 }
  const planStatus = data?.plan_status ?? 'free'

  return {
    isLoading,
    plan: data?.plan ?? 'starter',
    plan_status: planStatus,
    plan_expires_at: data?.plan_expires_at ?? null,
    limits,
    usage,

    // Convenience booleans
    canAddAgent: withinLimit(usage.agents, limits.max_agents),
    canUploadDoc: withinLimit(usage.kb_docs, limits.max_kb_docs),
    hasVoice: limits.has_voice,
    hasWhatsApp: limits.has_whatsapp,
    hasCustomPersonality: limits.has_custom_personality,
    hasAdvancedAnalytics: limits.has_advanced_analytics,
    hasApiAccess: limits.has_api_access,
    hasMultiAccount: limits.has_multi_account,

    isPastDue: planStatus === 'past_due',
    isCancelled: planStatus === 'cancelled',
    isActive: planStatus === 'active',
    isFree: planStatus === 'free',
  }
}
