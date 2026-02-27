'use client'

import { motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

interface WidgetLauncherProps {
  isOpen: boolean
  color: string
  avatarUrl?: string | null
  onToggle: () => void
}

export function WidgetLauncher({ isOpen, color, avatarUrl, onToggle }: WidgetLauncherProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[2147483647]">
      {/* Pulse ring */}
      {!isOpen && (
        <span
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ backgroundColor: color, opacity: 0.3 }}
        />
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all"
        style={{ backgroundColor: color }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X size={22} className="text-white" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="Support" className="w-full h-full rounded-full object-cover" />
          ) : (
            <MessageCircle size={22} className="text-white" />
          )}
        </motion.div>
      </motion.button>
    </div>
  )
}
