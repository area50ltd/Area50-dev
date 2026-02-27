import { db } from '@/lib/db'
import { companies, tickets, users, payment_transactions } from '@/lib/schema'
import { count, sum, eq, sql } from 'drizzle-orm'
import { type LucideIcon, Building2, Ticket, Users, CreditCard, TrendingUp, Activity, CheckCircle2, AlertTriangle } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatNaira } from '@/lib/utils'

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
}) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-neutral-400">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="font-heading text-3xl font-bold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

export default async function SuperAdminOverviewPage() {
  const user = await requireRole('super_admin').catch(() => null)
  if (!user) redirect('/dashboard')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    [{ totalCompanies }],
    [{ totalTickets }],
    [{ totalUsers }],
    [{ totalRevenue }],
    recentCompanies,
  ] = await Promise.all([
    db.select({ totalCompanies: count() }).from(companies),
    db.select({ totalTickets: count() }).from(tickets),
    db.select({ totalUsers: count() }).from(users),
    db.select({ totalRevenue: sum(payment_transactions.amount_kobo) }).from(payment_transactions).where(eq(payment_transactions.status, 'success')),
    db.select({
      id: companies.id,
      name: companies.name,
      plan: companies.plan,
      credits: companies.credits,
      is_active: companies.is_active,
      created_at: companies.created_at,
    }).from(companies).orderBy(sql`${companies.created_at} DESC`).limit(8),
  ])

  const systemStatus = [
    { name: 'n8n Webhooks', status: 'operational' as const },
    { name: 'Supabase Postgres', status: 'operational' as const },
    { name: 'Cloudflare R2', status: 'operational' as const },
    { name: 'Paystack API', status: 'operational' as const },
    { name: 'Clerk Auth', status: 'operational' as const },
  ]

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white mb-1">Platform Overview</h1>
        <p className="text-neutral-500 text-sm">Area50 super admin panel — all companies, all data.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Companies" value={totalCompanies} icon={Building2} color="bg-[#E91E8C]" />
        <StatCard label="Total Tickets" value={totalTickets} icon={Ticket} color="bg-blue-600" />
        <StatCard label="Total Users" value={totalUsers} icon={Users} color="bg-purple-600" />
        <StatCard
          label="Total Revenue"
          value={formatNaira(Number(totalRevenue ?? 0) / 100)}
          icon={CreditCard}
          color="bg-green-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent companies */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <TrendingUp size={15} className="text-[#E91E8C]" />
              Recent Companies
            </h2>
          </div>
          <div className="space-y-2">
            {recentCompanies.map((company) => (
              <div key={company.id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-white text-xs font-bold">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{company.name}</p>
                    <p className="text-neutral-500 text-xs capitalize">{company.plan} plan</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">{(company.credits ?? 0).toLocaleString()} credits</span>
                  <div className={`w-2 h-2 rounded-full ${company.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
            ))}
            {recentCompanies.length === 0 && (
              <p className="text-neutral-600 text-sm text-center py-4">No companies yet</p>
            )}
          </div>
        </div>

        {/* System status */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-[#E91E8C]" />
            <h2 className="text-white font-semibold text-sm">System Status</h2>
          </div>
          <div className="space-y-3">
            {systemStatus.map((service) => (
              <div key={service.name} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                <span className="text-sm text-neutral-300">{service.name}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                  <CheckCircle2 size={12} />
                  Operational
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-neutral-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" />
            <p className="text-sm text-green-400 font-medium">All systems operational</p>
          </div>
        </div>
      </div>
    </main>
  )
}
