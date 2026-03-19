'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Send, Paperclip, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WidgetLivePreviewProps {
  color: string
  welcomeMessage: string
  companyName: string
  avatarUrl?: string | null
  device: 'desktop' | 'mobile'
}

// ── Fake webpage content ──────────────────────────────────────────────────────
function FakeWebpage({ color }: { color: string }) {
  return (
    <div className="h-full bg-white overflow-hidden">
      {/* Fake nav */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{ backgroundColor: color }} />
          <div className="w-16 h-2.5 bg-neutral-200 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-2 bg-neutral-100 rounded-full" />
          <div className="w-8 h-2 bg-neutral-100 rounded-full" />
          <div className="w-12 h-5 rounded-full" style={{ backgroundColor: color + '25' }} />
        </div>
      </div>
      {/* Fake hero */}
      <div className="px-5 pt-5 pb-3 space-y-2.5">
        <div className="w-2/3 h-4 bg-neutral-800 rounded-full opacity-80" />
        <div className="w-1/2 h-3 bg-neutral-300 rounded-full" />
        <div className="w-3/5 h-3 bg-neutral-200 rounded-full" />
        <div className="flex gap-2 pt-2">
          <div className="h-7 w-20 rounded-full" style={{ backgroundColor: color }} />
          <div className="h-7 w-20 rounded-full border border-neutral-200 bg-white" />
        </div>
      </div>
      {/* Fake cards */}
      <div className="px-5 pt-2 grid grid-cols-3 gap-2">
        {[color + '15', '#f3f4f6', '#f3f4f6'].map((bg, i) => (
          <div key={i} className="h-14 rounded-xl border border-neutral-100" style={{ backgroundColor: bg }}>
            <div className="p-2 space-y-1.5">
              <div className="w-4 h-4 rounded-md" style={{ backgroundColor: i === 0 ? color + '40' : '#e5e7eb' }} />
              <div className="w-full h-1.5 bg-neutral-200 rounded-full" />
              <div className="w-2/3 h-1.5 bg-neutral-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      {/* Fake content rows */}
      <div className="px-5 pt-4 space-y-2">
        {[70, 85, 55].map((w, i) => (
          <div key={i} className="h-2 bg-neutral-100 rounded-full" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

// ── Interactive widget overlay ────────────────────────────────────────────────
function WidgetOverlay({
  color, welcomeMessage, companyName, avatarUrl, scale = 1,
}: {
  color: string
  welcomeMessage: string
  companyName: string
  avatarUrl?: string | null
  scale?: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  const initials = companyName.charAt(0).toUpperCase()

  return (
    <div
      className="absolute bottom-3 right-3 flex flex-col items-end gap-2"
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom right' }}
    >
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden"
          >
            {/* Header */}
            <div className="px-3.5 py-3 flex items-center gap-2.5" style={{ backgroundColor: color }}>
              <div
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
              >
                {avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{companyName}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-white/70 text-[10px]">Online · Typically replies instantly</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="bg-neutral-50 px-3 py-3 space-y-3" style={{ maxHeight: 180, overflow: 'hidden' }}>
              {/* Welcome bubble */}
              <div className="flex gap-2 items-end">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  {avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm border border-neutral-100 max-w-[85%]">
                  <p className="text-[11px] text-neutral-700 leading-relaxed">{welcomeMessage}</p>
                </div>
              </div>
              {/* Sample customer message */}
              <div className="flex justify-end">
                <div
                  className="rounded-2xl rounded-br-sm px-3 py-2 text-white text-[11px] leading-relaxed max-w-[80%]"
                  style={{ backgroundColor: color }}
                >
                  Hi, I need help with my order
                </div>
              </div>
              {/* Sample AI reply with typing indicator then reply */}
              <div className="flex gap-2 items-end">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                  style={{ backgroundColor: color }}
                >
                  AI
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm border border-neutral-100 max-w-[85%]">
                  <p className="text-[11px] text-neutral-700 leading-relaxed">
                    Of course! I&apos;d be happy to help. Can you share your order number?
                  </p>
                </div>
              </div>
            </div>

            {/* Quick replies */}
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto bg-neutral-50 border-t border-neutral-100/60">
              {['Track my order', 'Cancel order', 'Talk to human'].map((r) => (
                <button
                  key={r}
                  className="shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap"
                  style={{ borderColor: color + '60', color }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-neutral-100 bg-white">
              <div className="flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-200">
                <Paperclip size={12} className="text-neutral-300 shrink-0" />
                <span className="flex-1 text-[11px] text-neutral-400">Type a message…</span>
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <Send size={10} />
                </div>
              </div>
              <p className="text-center text-[9px] text-neutral-300 mt-1.5">Powered by Zentativ AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher FAB */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ backgroundColor: color }}
        aria-label="Toggle chat"
      >
        {/* Pulse ring when closed */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: color }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={20} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

// ── Desktop browser frame ─────────────────────────────────────────────────────
function DesktopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-neutral-200 bg-white" style={{ width: 500, height: 380 }}>
      <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-2 flex items-center gap-2.5">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white border border-neutral-200 rounded-md px-2.5 py-1 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60 shrink-0" />
            <span className="text-[10px] text-neutral-400 font-mono tracking-tight">yourwebsite.com</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {[1,2,3].map(i => <div key={i} className="w-3 h-3 bg-neutral-200 rounded-sm" />)}
        </div>
      </div>
      <div className="relative overflow-hidden" style={{ height: 347 }}>
        {children}
      </div>
    </div>
  )
}

// ── Mobile phone frame ────────────────────────────────────────────────────────
function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ width: 240, height: 480 }}>
      {/* Phone body */}
      <div className="absolute inset-0 rounded-[36px] border-[8px] border-neutral-800 bg-white shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-white">
          <span className="text-[8px] font-semibold text-neutral-800">9:41</span>
          <div className="flex items-center gap-1">
            {[3,2,1].map(i => <div key={i} className={cn('h-2 w-0.5 rounded-full bg-neutral-800', i === 1 ? 'opacity-30' : i === 2 ? 'opacity-60' : '')} />)}
            <div className="w-3 h-2 rounded-sm border border-neutral-800 ml-1 relative">
              <div className="absolute inset-0.5 right-0.5 bg-neutral-800 rounded-sm" />
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="relative overflow-hidden" style={{ height: 420 }}>
          {children}
        </div>
      </div>
      {/* Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-neutral-800 rounded-b-xl z-10" />
      {/* Side buttons */}
      <div className="absolute right-[-10px] top-20 w-1.5 h-8 bg-neutral-700 rounded-r-md" />
      <div className="absolute left-[-10px] top-16 w-1.5 h-6 bg-neutral-700 rounded-l-md" />
      <div className="absolute left-[-10px] top-24 w-1.5 h-5 bg-neutral-700 rounded-l-md" />
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function WidgetLivePreview({ color, welcomeMessage, companyName, avatarUrl, device }: WidgetLivePreviewProps) {
  const isDesktop = device === 'desktop'

  const content = (
    <>
      <FakeWebpage color={color} />
      <WidgetOverlay
        color={color}
        welcomeMessage={welcomeMessage}
        companyName={companyName}
        avatarUrl={avatarUrl}
        scale={isDesktop ? 1 : 0.85}
      />
    </>
  )

  return (
    <div className="flex items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {isDesktop ? (
          <motion.div
            key="desktop"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <DesktopFrame>{content}</DesktopFrame>
          </motion.div>
        ) : (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <MobileFrame>{content}</MobileFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
