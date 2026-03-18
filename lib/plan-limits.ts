/**
 * Plan limits — single source of truth for feature enforcement.
 *
 * The canonical values live in the `plans` DB table (set by super admin).
 * This file provides a hardcoded fallback map used for:
 *   - Client-side instant gating (no DB round-trip)
 *   - API guard fallback when plan row is unavailable
 *
 * DB values always win over the fallback map — this map is the safety net.
 */

export interface PlanLimits {
  max_agents: number              // -1 = unlimited
  max_kb_docs: number             // -1 = unlimited
  has_voice: boolean
  has_whatsapp: boolean
  has_custom_personality: boolean
  has_advanced_analytics: boolean
  has_api_access: boolean
  has_multi_account: boolean
  support_tier: 'email' | 'priority_email' | 'dedicated'
}

// ─── Fallback map (matches seeded DB values) ──────────────────────────────────

export const PLAN_LIMITS_FALLBACK: Record<string, PlanLimits> = {
  starter: {
    max_agents: 1,
    max_kb_docs: 10,
    has_voice: false,
    has_whatsapp: false,
    has_custom_personality: false,
    has_advanced_analytics: false,
    has_api_access: false,
    has_multi_account: false,
    support_tier: 'email',
  },
  growth: {
    max_agents: 5,
    max_kb_docs: 50,
    has_voice: true,
    has_whatsapp: false,
    has_custom_personality: true,
    has_advanced_analytics: true,
    has_api_access: false,
    has_multi_account: false,
    support_tier: 'priority_email',
  },
  business: {
    max_agents: -1,
    max_kb_docs: -1,
    has_voice: true,
    has_whatsapp: true,
    has_custom_personality: true,
    has_advanced_analytics: true,
    has_api_access: true,
    has_multi_account: false,
    support_tier: 'dedicated',
  },
  agency: {
    max_agents: -1,
    max_kb_docs: -1,
    has_voice: true,
    has_whatsapp: true,
    has_custom_personality: true,
    has_advanced_analytics: true,
    has_api_access: true,
    has_multi_account: true,
    support_tier: 'dedicated',
  },
}

/** Returns limits for a plan key, falling back to starter if unknown. */
export function getPlanLimits(planKey: string): PlanLimits {
  return PLAN_LIMITS_FALLBACK[planKey] ?? PLAN_LIMITS_FALLBACK.starter
}

/** Build a PlanLimits object from a DB plan row (partial — some columns may be null if migration not yet run). */
export function limitsFromDbRow(row: {
  max_agents?: number | null
  max_kb_docs?: number | null
  has_voice?: boolean | null
  has_whatsapp?: boolean | null
  has_custom_personality?: boolean | null
  has_advanced_analytics?: boolean | null
  has_api_access?: boolean | null
  has_multi_account?: boolean | null
  support_tier?: string | null
  key: string
}): PlanLimits {
  const fallback = getPlanLimits(row.key)
  return {
    max_agents: row.max_agents ?? fallback.max_agents,
    max_kb_docs: row.max_kb_docs ?? fallback.max_kb_docs,
    has_voice: row.has_voice ?? fallback.has_voice,
    has_whatsapp: row.has_whatsapp ?? fallback.has_whatsapp,
    has_custom_personality: row.has_custom_personality ?? fallback.has_custom_personality,
    has_advanced_analytics: row.has_advanced_analytics ?? fallback.has_advanced_analytics,
    has_api_access: row.has_api_access ?? fallback.has_api_access,
    has_multi_account: row.has_multi_account ?? fallback.has_multi_account,
    support_tier: (row.support_tier as PlanLimits['support_tier']) ?? fallback.support_tier,
  }
}

/** true when the count is within limit (handles -1 = unlimited). */
export function withinLimit(current: number, max: number): boolean {
  return max === -1 || current < max
}

/** Returns the name of the lowest plan that unlocks a feature. */
export function requiredPlanFor(feature: keyof PlanLimits): string {
  const order = ['starter', 'growth', 'business', 'agency']
  for (const key of order) {
    const limits = PLAN_LIMITS_FALLBACK[key]
    if (typeof limits[feature] === 'boolean' && limits[feature] === true) return key
    if (typeof limits[feature] === 'number' && (limits[feature] as number) > 1) return key
  }
  return 'agency'
}
