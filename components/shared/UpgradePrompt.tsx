'use client'

import { useRouter } from 'next/navigation'
import { Lock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  business: 'Business',
  agency: 'Agency',
}

interface UpgradePromptProps {
  feature: string                      // Human-readable feature name, e.g. "Voice Calls"
  requiredPlan?: string                // Plan key needed, e.g. "growth"
  description?: string                 // Optional extra explanation
  compact?: boolean                    // Smaller inline version
  className?: string
}

export function UpgradePrompt({
  feature,
  requiredPlan = 'growth',
  description,
  compact = false,
  className,
}: UpgradePromptProps) {
  const router = useRouter()
  const planName = PLAN_NAMES[requiredPlan] ?? requiredPlan

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-neutral-400', className)}>
        <Lock size={12} className="text-violet-400 shrink-0" />
        <span>
          {feature} requires{' '}
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="text-violet-600 font-medium hover:underline"
          >
            {planName}
          </button>
        </span>
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-xl border border-violet-200 bg-violet-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4',
      className,
    )}>
      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
        <Lock size={18} className="text-violet-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 text-sm">{feature}</p>
        <p className="text-neutral-500 text-xs mt-0.5">
          {description ?? `Available on ${planName} plan and above.`}
        </p>
      </div>

      <button
        onClick={() => router.push('/dashboard/billing')}
        className="flex items-center justify-center gap-2 bg-violet-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-violet-700 transition-colors shrink-0 w-full sm:w-auto"
      >
        <Zap size={13} />
        Upgrade to {planName}
      </button>
    </div>
  )
}

/** Small lock badge icon to overlay on locked UI elements */
export function LockBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full',
      className,
    )}>
      <Lock size={9} /> Pro
    </span>
  )
}
