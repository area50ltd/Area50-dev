import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#1B2A4A] text-white hover:bg-[#243460]',
        secondary: 'border-transparent bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600',
        outline: 'text-neutral-700 border-neutral-200',
        pink: 'border-transparent bg-[#FDE7F3] text-[#E91E8C]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
