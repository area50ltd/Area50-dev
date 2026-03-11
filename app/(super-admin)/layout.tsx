import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, Building2, Zap, Settings2, LogOut, Package, Receipt, SlidersHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Organizations', href: '/super-admin/organizations', icon: Building2 },
  { label: 'Credits', href: '/super-admin/credits', icon: Zap },
  { label: 'Plans', href: '/super-admin/plans', icon: Package },
  { label: 'Transactions', href: '/super-admin/transactions', icon: Receipt },
  { label: 'Settings', href: '/super-admin/settings', icon: SlidersHorizontal },
  { label: 'System', href: '/super-admin/system', icon: Settings2 },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'super_admin') redirect('/dashboard')
  return (
    <div className="dark flex min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <aside className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-neutral-800">
          <div className="overflow-hidden" style={{ height: '36px' }}>
            <Image
              src="/images/logo/logo-dark.png"
              alt="Zentativ"
              width={360}
              height={108}
              className="h-28 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
              priority
            />
          </div>
          <p className="text-neutral-500 text-xs mt-1.5">Super Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all group"
            >
              <Icon size={16} className="group-hover:text-violet-400 transition-colors" />
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
