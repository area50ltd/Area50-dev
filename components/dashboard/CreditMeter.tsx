'use client'

import { motion } from 'framer-motion'
import { Zap, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CreditMeterProps {
  credits: number
  maxCredits: number
  planName?: string
}

export function CreditMeter({ credits, maxCredits, planName }: CreditMeterProps) {
  const pct = Math.min((credits / maxCredits) * 100, 100)
  const isLow = credits < 500
  const isCritical = credits <= 0

  return (
    <div className={cn(
      'rounded-xl border p-5',
      isCritical ? 'bg-red-50 border-red-200' : isLow ? 'bg-orange-50 border-orange-200' : 'bg-white border-neutral-100'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className={isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-[#E91E8C]'} />
          <span className="font-medium text-sm text-neutral-700">
            Credits Remaining
          </span>
        </div>
        {planName && (
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            {planName}
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            isCritical ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-gradient-to-r from-[#E91E8C] to-[#FF6BB5]'
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="font-heading text-2xl font-bold text-[#1B2A4A]">
          {credits.toLocaleString()}
          <span className="font-body text-sm text-neutral-400 font-normal ml-1">/ {maxCredits.toLocaleString()}</span>
        </p>
        {(isLow || isCritical) && (
          <Link href="/dashboard/billing" className="flex items-center gap-1 text-xs font-medium text-[#E91E8C] hover:underline">
            <AlertTriangle size={11} />
            Top up
          </Link>
        )}
      </div>
    </div>
  )
}
