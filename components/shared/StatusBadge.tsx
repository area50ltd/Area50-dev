import { cn } from '@/lib/utils'
import { statusColors, priorityColors, sentimentColors } from '@/lib/constants'

interface BadgeProps {
  value: string
  className?: string
}

export function StatusBadge({ value, className }: BadgeProps) {
  const colorClass = statusColors[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', colorClass, className)}>
      {value.replace('_', ' ')}
    </span>
  )
}

export function PriorityBadge({ value, className }: BadgeProps) {
  const colorClass = priorityColors[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', colorClass, className)}>
      {value}
    </span>
  )
}

export function SentimentBadge({ value, className }: BadgeProps) {
  const colorClass = sentimentColors[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', colorClass, className)}>
      {value}
    </span>
  )
}

export function AgentStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  }
  return (
    <span className={cn('w-2.5 h-2.5 rounded-full inline-block', colors[status] ?? 'bg-gray-400')} />
  )
}
