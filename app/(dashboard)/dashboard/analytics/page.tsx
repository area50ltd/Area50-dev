'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TopBar } from '@/components/dashboard/TopBar'
import {
  BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import {
  MessageSquare, TicketCheck, CheckCircle2,
  Bot, Loader2, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DATE_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

interface Summary {
  totalMessages: number
  totalTickets: number
  resolvedTickets: number
  resolutionRate: number
  aiMessages: number
  humanMessages: number
}

interface AnalyticsData {
  summary: Summary
  messagesOverTime: { date: string; ai: number; human: number; total: number }[]
  channelData: { channel: string; tickets: number }[]
  pieData: { name: string; value: number; color: string }[]
  resolutionData: { day: string; rate: number; total: number; resolved: number }[]
  sentimentData: { name: string; value: number; color: string }[]
  statusData: { name: string; value: number; color: string }[]
}

function useAnalytics(days: number) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', days],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?days=${days}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    },
    staleTime: 60_000,
  })
}

// ── Custom dark tooltip ───────────────────────────────────────────────
function DarkTooltip({ active, payload, label, valueLabel, valueFormat }: TooltipProps<number, string> & { valueLabel?: string; valueFormat?: (v: number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 shadow-xl min-w-[120px]">
      {label && <p className="text-neutral-400 text-[11px] mb-1.5 font-medium">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color ?? entry.stroke }} />
          <span className="text-neutral-300 text-[11px]">{entry.name ?? valueLabel}</span>
          <span className="text-white text-[11px] font-semibold ml-auto pl-3">
            {valueFormat ? valueFormat(entry.value as number) : (entry.value as number)?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Chart card wrapper ────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, className }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden', className)}>
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-heading text-sm font-bold text-neutral-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-2 pb-5">{children}</div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex items-start gap-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-heading font-bold text-neutral-900 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────
function EmptyChart({ height = 220 }: { height?: number }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-neutral-300`} style={{ height }}>
      <BarChart2 size={28} strokeWidth={1.5} />
      <p className="text-xs">No data for this period yet</p>
    </div>
  )
}

// ── Donut chart with center label ─────────────────────────────────────
function DonutChart({ data, label }: { data: { name: string; value: number; color: string }[]; label?: string }) {
  const hasData = data.some((d) => d.value > 0)
  if (!hasData) return <EmptyChart height={240} />
  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={96}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => (
              <DarkTooltip
                active={active}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                payload={payload as any}
                label={undefined}
                valueFormat={(v) => `${v}${label === '%' ? '%' : ''}`}
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-4">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[11px] text-neutral-500">{d.name}</span>
            <span className="text-[11px] font-semibold text-neutral-800 ml-0.5">{d.value}{label === '%' ? '%' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Custom axis tick ──────────────────────────────────────────────────
const AxisTick = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) => (
  <text x={x} y={y} dy={12} textAnchor="middle" fill="#9ca3af" fontSize={10} fontFamily="inherit">
    {payload?.value}
  </text>
)
const YAxisTick = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) => (
  <text x={x} y={y} dx={-4} textAnchor="end" fill="#9ca3af" fontSize={10} fontFamily="inherit" dominantBaseline="middle">
    {payload?.value}
  </text>
)

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[1])
  const { data, isLoading, isError } = useAnalytics(selectedRange.days)

  const summary = data?.summary

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Analytics" />

      <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-6xl w-full">

        {/* ── Date range ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {DATE_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setSelectedRange(r)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                selectedRange.days === r.days
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:border-violet-300 hover:text-violet-600',
              )}
            >
              {r.label}
            </button>
          ))}
          <span className="text-xs text-neutral-400 ml-1">
            {isLoading ? 'Loading…' : `Showing last ${selectedRange.days} days`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading analytics…</span>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-sm text-red-500">
            Failed to load analytics. Please try again.
          </div>
        ) : (
          <>
            {/* ── Summary stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Total Messages"
                value={(summary?.totalMessages ?? 0).toLocaleString()}
                icon={MessageSquare}
                color="bg-violet-50 text-violet-600"
                sub={`${(summary?.aiMessages ?? 0).toLocaleString()} AI · ${(summary?.humanMessages ?? 0).toLocaleString()} Human`}
              />
              <StatCard
                label="Total Tickets"
                value={(summary?.totalTickets ?? 0).toLocaleString()}
                icon={TicketCheck}
                color="bg-blue-50 text-blue-600"
                sub={`${(summary?.resolvedTickets ?? 0).toLocaleString()} resolved`}
              />
              <StatCard
                label="Resolution Rate"
                value={`${summary?.resolutionRate ?? 0}%`}
                icon={CheckCircle2}
                color="bg-emerald-50 text-emerald-600"
                sub={`${selectedRange.label} average`}
              />
              <StatCard
                label="AI Automation"
                value={
                  summary?.totalMessages
                    ? `${Math.round(((summary.aiMessages) / summary.totalMessages) * 100)}%`
                    : '—'
                }
                icon={Bot}
                color="bg-orange-50 text-orange-500"
                sub="of messages handled by AI"
              />
            </div>

            {/* ── Charts grid ── */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">

              {/* Messages over time */}
              <ChartCard
                title="Messages Over Time"
                subtitle="AI vs human agent message volume"
              >
                {!data?.messagesOverTime?.length ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data.messagesOverTime} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="humanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="date" tick={<AxisTick />} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={<YAxisTick />} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Area type="monotone" dataKey="ai" stroke="#7c3aed" strokeWidth={2} fill="url(#aiGrad)" name="AI" dot={false} activeDot={{ r: 4, fill: '#7c3aed' }} />
                      <Area type="monotone" dataKey="human" stroke="#111827" strokeWidth={2} fill="url(#humanGrad)" name="Human" dot={false} activeDot={{ r: 4, fill: '#111827' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Channel breakdown */}
              <ChartCard
                title="Channel Breakdown"
                subtitle="Tickets by communication channel"
              >
                {!data?.channelData?.length ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.channelData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="channel" tick={<AxisTick />} axisLine={false} tickLine={false} />
                      <YAxis tick={<YAxisTick />} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="tickets" name="Tickets" radius={[6, 6, 0, 0]}>
                        {data.channelData.map((_, i) => (
                          <Cell key={i} fill={['#7c3aed', '#a78bfa', '#c4b5fd'][i % 3]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Resolution rate trend */}
              <ChartCard
                title="Resolution Rate Trend"
                subtitle="% of tickets resolved per day"
              >
                {!data?.resolutionData?.length ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data.resolutionData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="day" tick={<AxisTick />} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis domain={[0, 100]} tick={<YAxisTick />} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip valueFormat={(v) => `${v}%`} />} />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#resGrad)"
                        name="Resolution %"
                        dot={false}
                        activeDot={{ r: 4, fill: '#10b981' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Ticket volume trend */}
              <ChartCard
                title="Daily Ticket Volume"
                subtitle="New tickets created per day"
              >
                {!data?.resolutionData?.length ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.resolutionData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="day" tick={<AxisTick />} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={<YAxisTick />} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="total" name="Total" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" name="Resolved" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* AI vs Human resolution donut */}
              <ChartCard
                title="AI vs Human Resolution"
                subtitle="Who resolves tickets"
              >
                <DonutChart data={data?.pieData ?? []} label="%" />
              </ChartCard>

              {/* Sentiment distribution donut */}
              <ChartCard
                title="Customer Sentiment"
                subtitle="Ticket sentiment distribution"
              >
                <DonutChart data={data?.sentimentData ?? []} />
              </ChartCard>

            </div>

            {/* ── Ticket status breakdown ── */}
            {(data?.statusData?.length ?? 0) > 0 && (
              <ChartCard
                title="Ticket Status Breakdown"
                subtitle="Current distribution of ticket statuses"
                className="lg:col-span-2"
              >
                <div className="px-3">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {data!.statusData.map((s) => {
                      const total = data!.statusData.reduce((acc, r) => acc + r.value, 0)
                      const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
                      return (
                        <div key={s.name} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                            <span className="text-xs font-semibold text-neutral-600">{s.name}</span>
                          </div>
                          <p className="text-2xl font-heading font-bold text-neutral-900">{s.value.toLocaleString()}</p>
                          <div className="mt-2 h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1">{pct}% of total</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </ChartCard>
            )}
          </>
        )}
      </main>
    </div>
  )
}
