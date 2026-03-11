'use client'

import { Bell, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CREDIT_WARNING_THRESHOLD } from '@/lib/constants'

interface TopBarProps {
  title: string
  credits?: number | null
}

export function TopBar({ title, credits }: TopBarProps) {
  const lowCredits = credits !== undefined && credits !== null && credits < CREDIT_WARNING_THRESHOLD

  return (
    <header className="h-14 bg-white border-b border-neutral-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-heading text-lg font-bold text-neutral-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Credit balance chip */}
        {credits !== undefined && credits !== null && (
          <Link href="/dashboard/billing">
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                lowCredits
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
              )}
            >
              <Zap size={12} className={lowCredits ? 'text-red-500' : 'text-violet-600'} />
              <span>{credits.toLocaleString()} credits</span>
              {lowCredits && <span className="text-red-400">· Low!</span>}
            </div>
          </Link>
        )}

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600" />
        </button>
      </div>
    </header>
  )
}
