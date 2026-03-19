import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')
  if (user.role === 'super_admin') redirect('/super-admin')
  if (!user.company_id) redirect('/onboarding')

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-60 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
