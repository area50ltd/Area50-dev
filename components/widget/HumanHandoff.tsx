'use client'

import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'

interface HumanHandoffProps {
  queuePosition?: number | null
  onContinueWithAI: () => void
}

export function HumanHandoff({ queuePosition, onContinueWithAI }: HumanHandoffProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-[#FDE7F3] flex items-center justify-center mx-auto mb-4">
          <LoadingSpinner size="md" />
        </div>
        <h3 className="font-heading font-bold text-[#1B2A4A] text-base mb-2">
          Connecting you to an agent...
        </h3>
        <p className="text-neutral-500 text-sm leading-relaxed">
          A human agent will join this chat shortly.
        </p>
      </motion.div>

      {queuePosition !== null && queuePosition !== undefined && (
        <div className="bg-neutral-50 rounded-xl px-5 py-3 border border-neutral-100 mb-5">
          <p className="text-sm font-medium text-neutral-700">
            Position in queue: <strong className="text-[#E91E8C]">#{queuePosition}</strong>
          </p>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onContinueWithAI}
        className="text-neutral-500 text-xs rounded-full"
      >
        Continue with AI assistant instead
      </Button>
    </div>
  )
}
