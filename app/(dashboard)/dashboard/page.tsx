import { TopBar } from '@/components/dashboard/TopBar'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { VoiceSetupBanner } from '@/components/dashboard/VoiceSetupBanner'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { tickets, companies } from '@/lib/schema'
import { eq, and, gte, count } from 'drizzle-orm'
import {
  Ticket,
  CheckCircle2,
  Clock,
  Zap,
  Eye,
  BarChart2,
  UserPlus,
  LayoutTemplate,
  FileUp,
  Phone,
  Users,
  CreditCard,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

// ─── Quick Action Cards ───────────────────────────────────────────────────────

const quickActions = [
  { label: 'View Tickets', href: '/dashboard/tickets', icon: Eye, color: 'bg-blue-50 text-blue-600' },
  { label: 'Usage Analytics', href: '/dashboard/analytics', icon: BarChart2, color: 'bg-purple-50 text-purple-600' },
  { label: 'Add Team Member', href: '/dashboard/users', icon: UserPlus, color: 'bg-green-50 text-green-600' },
  { label: 'Configure Widget', href: '/dashboard/widget', icon: LayoutTemplate, color: 'bg-violet-50 text-violet-600' },
  { label: 'Upload Company Data', href: '/dashboard/knowledge', icon: FileUp, color: 'bg-orange-50 text-orange-600' },
  { label: 'Call Settings', href: '/dashboard/settings/voice', icon: Phone, color: 'bg-sky-50 text-sky-600' },
  { label: 'Agent Management', href: '/dashboard/agents', icon: Users, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Credit Top-up', href: '/dashboard/billing', icon: CreditCard, color: 'bg-rose-50 text-rose-600' },
]

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getDashboardData(companyId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalTickets, openTickets, resolvedToday, company] = await Promise.all([
    db.select({ count: count() }).from(tickets).where(eq(tickets.company_id, companyId)),
    db.select({ count: count() }).from(tickets).where(
      and(eq(tickets.company_id, companyId), eq(tickets.status, 'open'))
    ),
    db.select({ count: count() }).from(tickets).where(
      and(
        eq(tickets.company_id, companyId),
        eq(tickets.is_resolved, true),
        gte(tickets.resolved_at, today)
      )
    ),
    db.query.companies.findFirst({ where: eq(companies.id, companyId) }),
  ])

  return {
    totalTickets: totalTickets[0]?.count ?? 0,
    openTickets: openTickets[0]?.count ?? 0,
    resolvedToday: resolvedToday[0]?.count ?? 0,
    credits: company?.credits ?? 0,
    plan: company?.plan ?? 'starter',
    company,
  }
}

async function getRecentActivity(companyId: string) {
  return db.query.tickets.findMany({
    where: eq(tickets.company_id, companyId),
    orderBy: (t, { desc }) => [desc(t.updated_at)],
    limit: 10,
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
const EMPTY_DATA: DashboardData = {
  totalTickets: 0, openTickets: 0, resolvedToday: 0,
  credits: 0, plan: 'starter', company: undefined,
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  // DB not configured or user not in DB yet — show setup prompt
  if (!user) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Dashboard" credits={0} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-10 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-5">
              <Zap size={28} className="text-violet-600" />
            </div>
            <h2 className="font-heading text-xl font-bold text-neutral-900 mb-2">Database Setup Required</h2>
            <p className="text-sm text-neutral-500 leading-relaxed mb-5">
              Your account is ready but the database isn&apos;t connected yet.
              Add your <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">DATABASE_URL</code> to{' '}
              <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> then restart the server.
            </p>
            <p className="text-xs text-neutral-400">
              Get your connection string from <strong>Supabase → Project Settings → Database → Connection string (Transaction)</strong>
            </p>
          </div>
        </main>
      </div>
    )
  }

  // User exists but no company yet — show onboarding prompt
  if (!user.company_id) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Dashboard" credits={0} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-10 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-violet-600" />
            </div>
            <h2 className="font-heading text-xl font-bold text-neutral-900 mb-2">Welcome to Zentativ!</h2>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Your account is set up. Complete onboarding to create your company workspace.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              Start Onboarding →
            </Link>
          </div>
        </main>
      </div>
    )
  }

  let data = EMPTY_DATA
  let activity: Awaited<ReturnType<typeof getRecentActivity>> = []

  try {
    ;[data, activity] = await Promise.all([
      getDashboardData(user.company_id),
      getRecentActivity(user.company_id),
    ])
  } catch {
    // DB query failed — show empty state, don't crash
  }

  const planCreditsMap: Record<string, number> = {
    starter: 5_000,
    growth: 15_000,
    business: 40_000,
  }
  const maxCredits = planCreditsMap[data.plan ?? 'starter'] ?? 5_000

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Dashboard" credits={data.credits} />

      <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Voice setup banner — shown when voice is not yet configured */}
        {!data.company?.vapi_assistant_id && <VoiceSetupBanner />}

        {/* Low-credit warning banner */}
        {data.credits <= 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700">You&apos;ve run out of credits</p>
              <p className="text-xs text-red-600 mt-0.5">AI features are disabled. Top up now to restore your service.</p>
            </div>
            <Link
              href="/dashboard/billing"
              className="flex-shrink-0 bg-red-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              Top Up Now
            </Link>
          </div>
        )}
        {data.credits > 0 && data.credits < 500 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-700">Credits running low — {data.credits} remaining</p>
              <p className="text-xs text-amber-600 mt-0.5">Top up to avoid service interruption.</p>
            </div>
            <Link
              href="/dashboard/billing"
              className="flex-shrink-0 bg-amber-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Top Up Now
            </Link>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Tickets"
            value={data.totalTickets}
            icon={Ticket}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            change="All time"
            changeType="neutral"
          />
          <StatsCard
            label="Open Tickets"
            value={data.openTickets}
            icon={Clock}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            change="Needs attention"
            changeType={data.openTickets > 10 ? 'down' : 'neutral'}
          />
          <StatsCard
            label="Resolved Today"
            value={data.resolvedToday}
            icon={CheckCircle2}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            change="Great work!"
            changeType="up"
          />
          <div>
            <CreditMeter
              credits={data.credits ?? 0}
              maxCredits={maxCredits}
              planName={data.plan ? data.plan.charAt(0).toUpperCase() + data.plan.slice(1) : 'Starter'}
            />
          </div>
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="font-heading text-base font-bold text-neutral-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="bg-white rounded-xl border border-neutral-100 p-4 flex flex-col gap-3 hover:shadow-md hover:border-neutral-200 transition-all group cursor-pointer">
                  <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon size={18} />
                  </div>
                  <p className="font-medium text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    {action.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="font-heading text-base font-bold text-neutral-900 mb-3">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
            {activity.length === 0 ? (
              <div className="py-12 text-center">
                <Ticket size={28} className="mx-auto mb-3 text-neutral-200" />
                <p className="text-neutral-400 text-sm">No tickets yet. Share your widget to get started.</p>
              </div>
            ) : (
              activity.map((ticket) => (
                <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                  <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                    {/* Avatar placeholder */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-neutral-500 text-xs font-bold flex-shrink-0">
                      #
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        Ticket #{ticket.id.slice(0, 8)} — {ticket.category ?? 'General inquiry'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {ticket.channel ?? 'web_widget'} · {ticket.status}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400 flex-shrink-0">
                      {formatRelativeTime(ticket.updated_at)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
