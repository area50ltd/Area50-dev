'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, Zap, Menu, AlertTriangle, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { cn, formatRelativeTime } from '@/lib/utils'
import { CREDIT_WARNING_THRESHOLD } from '@/lib/constants'
import { useSidebar } from '@/hooks/useSidebar'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: 'warning' | 'escalation' | 'error' | 'info'
  title: string
  description: string
  href: string
  created_at: string
}

interface TopBarProps {
  title: string
  credits?: number | null
}

const notifIcon = (type: Notification['type']) => {
  if (type === 'warning') return <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
  if (type === 'escalation') return <ArrowUpRight size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
  if (type === 'error') return <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
  return <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
}

export function TopBar({ title, credits }: TopBarProps) {
  const lowCredits = credits !== undefined && credits !== null && credits < CREDIT_WARNING_THRESHOLD
  const { toggle } = useSidebar()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery<{ notifications: Notification[]; unread: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) return { notifications: [], unread: 0 }
      return res.json()
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  const notifications = data?.notifications ?? []
  const unread = data?.unread ?? 0

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 bg-white border-b border-neutral-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-heading text-base md:text-lg font-bold text-neutral-900">{title}</h1>
      </div>

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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-neutral-100 shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-800">Notifications</span>
                  {unread > 0 && (
                    <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                      {unread} new
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-neutral-400">
                      <CheckCircle2 size={24} className="mx-auto mb-2 text-neutral-300" />
                      All caught up!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                      >
                        {notifIcon(n.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-800">{n.title}</p>
                          <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{n.description}</p>
                          <p className="text-[10px] text-neutral-400 mt-1">{formatRelativeTime(n.created_at)}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
