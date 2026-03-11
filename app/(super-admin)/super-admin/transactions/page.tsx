'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, TrendingUp, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface Transaction {
  id: string
  paystack_reference: string | null
  amount_kobo: number
  credits_purchased: number
  status: string
  created_at: string
  company_name: string | null
}

interface Stats {
  total_revenue: number
  success_count: number
  pending_count: number
  failed_count: number
}

interface Response {
  transactions: Transaction[]
  total: number
  page: number
  totalPages: number
  stats: Stats
}

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    success: 'bg-green-900/40 text-green-400',
    pending: 'bg-yellow-900/40 text-yellow-400',
    failed: 'bg-red-900/40 text-red-400',
  }
  return `text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-neutral-700 text-neutral-400'}`
}

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({
    page: String(page),
    ...(search && { company: search }),
    ...(status && { status }),
  })

  const { data, isLoading } = useQuery<Response>({
    queryKey: ['sa-transactions', page, search, status],
    queryFn: () => fetch(`/api/super-admin/transactions?${params}`).then((r) => r.json()),
  })

  const stats = data?.stats
  const transactions = data?.transactions ?? []

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: stats ? formatNaira(stats.total_revenue) : '—',
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-600/10',
    },
    {
      label: 'Successful',
      value: stats?.success_count ?? '—',
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
    },
    {
      label: 'Pending',
      value: stats?.pending_count ?? '—',
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
    },
    {
      label: 'Failed',
      value: stats?.failed_count ?? '—',
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
    },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-neutral-800 rounded-xl border border-neutral-700 p-4">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-2xl font-heading font-bold text-white">{card.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg border border-neutral-700 bg-neutral-800 text-white text-sm focus:outline-none focus:border-violet-600"
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-xs text-neutral-500 self-center ml-auto">
          {isLoading ? 'Loading...' : `${data?.total ?? 0} transactions`}
        </span>
      </div>

      {/* Table */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Company</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Reference</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Credits</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-neutral-500">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-neutral-500">No transactions found</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors">
                  <td className="px-4 py-3 text-neutral-400 text-xs">
                    {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-white">{tx.company_name ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">
                    {tx.paystack_reference ? tx.paystack_reference.slice(0, 20) + '...' : '—'}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{formatNaira(tx.amount_kobo)}</td>
                  <td className="px-4 py-3 text-white">{tx.credits_purchased.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={statusBadge(tx.status)}>{tx.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 bg-neutral-800 text-white border-neutral-700"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={14} /> Previous
          </Button>
          <span className="text-sm text-neutral-500">
            Page {data?.page} of {data?.totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 bg-neutral-800 text-white border-neutral-700"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === (data?.totalPages ?? 1)}
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
