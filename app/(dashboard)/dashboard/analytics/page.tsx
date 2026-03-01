'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const DATE_RANGES = ['7 days', '30 days', '90 days', 'Custom']

// Mock data — in production fetched from DB aggregation
const msgData = Array.from({ length: 14 }, (_, i) => ({
  date: `Feb ${i + 1}`,
  ai: Math.floor(Math.random() * 120 + 40),
  human: Math.floor(Math.random() * 30 + 5),
}))

const channelData = [
  { channel: 'Web Chat', tickets: 142 },
  { channel: 'WhatsApp', tickets: 87 },
  { channel: 'Voice', tickets: 23 },
]

const resolutionData = Array.from({ length: 7 }, (_, i) => ({
  day: `Day ${i + 1}`,
  rate: Math.floor(Math.random() * 20 + 70),
}))

const pieData = [
  { name: 'AI Resolved', value: 68, color: '#E91E8C' },
  { name: 'Human Resolved', value: 32, color: '#1B2A4A' },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
      <h3 className="font-heading text-sm font-bold text-[#1B2A4A] mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30 days')

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Analytics" />

      <main className="flex-1 p-6 space-y-5">
        {/* Date range picker */}
        <div className="flex items-center gap-2">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                range === r
                  ? 'bg-[#1B2A4A] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-5">
          <ChartCard title="Messages Over Time (AI vs Human)">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={msgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ai" stroke="#E91E8C" strokeWidth={2} dot={false} name="AI" />
                <Line type="monotone" dataKey="human" stroke="#1B2A4A" strokeWidth={2} dot={false} name="Human" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Channel Breakdown">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#E91E8C" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Resolution Rate Trend (%)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={resolutionData}>
                <defs>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E91E8C" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E91E8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Rate']} />
                <Area type="monotone" dataKey="rate" stroke="#E91E8C" fill="url(#resGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="AI vs Human Resolution">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </main>
    </div>
  )
}
