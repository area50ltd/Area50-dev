'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TopBar } from '@/components/dashboard/TopBar'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Loader2 } from 'lucide-react'

const DATE_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

interface AnalyticsData {
  messagesOverTime: { date: string; ai: number; human: number }[]
  channelData: { channel: string; tickets: number }[]
  pieData: { name: string; value: number; color: string }[]
  resolutionData: { day: string; rate: number }[]
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
      <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex items-center justify-center text-sm text-neutral-400">
      No data for this period yet
    </div>
  )
}

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[1])
  const { data, isLoading } = useAnalytics(selectedRange.days)

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Analytics" />

      <main className="flex-1 p-6 space-y-5">
        {/* Date range picker */}
        <div className="flex items-center gap-2">
          {DATE_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setSelectedRange(r)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedRange.days === r.days
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-neutral-400" />
          </div>
        ) : (
          /* Charts grid */
          <div className="grid lg:grid-cols-2 gap-5">
            <ChartCard title="Messages Over Time (AI vs Human)">
              {!data?.messagesOverTime?.length ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.messagesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ai" stroke="#7c3aed" strokeWidth={2} dot={false} name="AI" />
                    <Line type="monotone" dataKey="human" stroke="#111827" strokeWidth={2} dot={false} name="Human" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Channel Breakdown">
              {!data?.channelData?.length ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.channelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="tickets" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Resolution Rate Trend (%)">
              {!data?.resolutionData?.length ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.resolutionData}>
                    <defs>
                      <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Rate']} />
                    <Area type="monotone" dataKey="rate" stroke="#7c3aed" fill="url(#resGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="AI vs Human Resolution">
              {!data?.pieData || data.pieData.every((p) => p.value === 0) ? <EmptyChart /> : (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                        {data.pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>
        )}
      </main>
    </div>
  )
}
