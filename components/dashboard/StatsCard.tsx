import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  href?: string
}

export function StatsCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-[#E91E8C]',
  iconBg = 'bg-[#FDE7F3]',
}: StatsCardProps) {
  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>

      <p className="font-heading text-3xl font-bold text-[#1B2A4A] mb-1.5">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      {change && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-500' : 'text-neutral-400'
        )}>
          <ChangeIcon size={12} />
          <span>{change}</span>
        </div>
      )}
    </div>
  )
}
