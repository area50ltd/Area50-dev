import Link from 'next/link'
import { LayoutDashboard, Building2, Zap, Settings2, LogOut, Shield, Package, Receipt, SlidersHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Organizations', href: '/super-admin/organizations', icon: Building2 },
  { label: 'Credits', href: '/super-admin/credits', icon: Zap },
  { label: 'Plans', href: '/super-admin/plans', icon: Package },
  { label: 'Transactions', href: '/super-admin/transactions', icon: Receipt },
  { label: 'Settings', href: '/super-admin/settings', icon: SlidersHorizontal },
  { label: 'System', href: '/super-admin/system', icon: Settings2 },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <aside className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E91E8C] flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">Area50</p>
              <p className="text-neutral-500 text-xs mt-0.5">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all group"
            >
              <Icon size={16} className="group-hover:text-[#E91E8C] transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-neutral-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <LogOut size={16} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
