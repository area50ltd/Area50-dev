'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
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
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
  { label: 'AI Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
  { label: 'Human Agents', href: '/dashboard/agents', icon: Users },
  { label: 'Team Chat', href: '/dashboard/team-chat', icon: MessageSquare },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Zap },
  { label: 'Widget', href: '/dashboard/widget', icon: LayoutTemplate },
  { label: 'Users & Roles', href: '/dashboard/users', icon: UserCog },
  { label: 'Credits & Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#1B2A4A] flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center">
            <span className="text-white font-heading font-bold text-sm">A</span>
          </div>
          <span className="font-heading font-bold text-white text-lg">Area50</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    active
                      ? 'text-[#E91E8C] bg-[#E91E8C]/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  {/* Active left border */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#E91E8C]" />
                  )}
                  <item.icon
                    size={17}
                    className={active ? 'text-[#E91E8C]' : 'text-white/50 group-hover:text-white/80'}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom — user */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">My Account</p>
          <p className="text-white/40 text-[11px]">Admin</p>
        </div>
      </div>
    </aside>
  )
}
