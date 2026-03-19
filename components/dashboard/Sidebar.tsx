'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Users,
  MessageSquare,
  Zap,
  LayoutTemplate,
  UserCog,
  CreditCard,
  Settings,
  Phone,
  BarChart2,
  LogOut,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/useSidebar'

const navItems: { label: string; href: string; icon: React.ElementType; exact?: boolean }[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
  { label: 'AI Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
  { label: 'Human Agents', href: '/dashboard/agents', icon: Users },
  { label: 'Team Chat', href: '/dashboard/team-chat', icon: MessageSquare },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { label: 'Voice & Phone', href: '/dashboard/settings/voice', icon: Phone },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Zap },
  { label: 'Widget', href: '/dashboard/widget', icon: LayoutTemplate },
  { label: 'Users & Roles', href: '/dashboard/users', icon: UserCog },
  { label: 'Credits & Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, exact: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, close } = useSidebar()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'w-60 bg-[#0A0A10] flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center overflow-hidden" style={{ height: '40px' }} onClick={close}>
            <Image
              src="/images/logo/logo-dark.png"
              alt="Zentativ"
              width={360}
              height={108}
              className="h-28 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
              priority
            />
          </Link>
          <button
            onClick={close}
            className="md:hidden text-white/40 hover:text-white/80 transition-colors p-1"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                      active
                        ? 'text-violet-400 bg-violet-600/10'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-500" />
                    )}
                    <item.icon
                      size={17}
                      className={active ? 'text-violet-400' : 'text-white/40 group-hover:text-white/70'}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom — user */}
        <div className="px-4 py-4 border-t border-white/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
            <span className="text-violet-400 text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">My Account</p>
            <p className="text-white/40 text-[11px]">Admin</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/30 hover:text-white/70 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  )
}
