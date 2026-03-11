'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TopBar } from '@/components/dashboard/TopBar'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { Button } from '@/components/ui/button'
import { formatNaira, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Zap,
  CheckCircle2,
  Receipt,
  Loader2,
  Clock,
  XCircle,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'

interface DbPlan {
  id: string
  key: string
  name: string
  price_kobo: number
  credits: number
  is_active: boolean
  sort_order: number
}

interface DbCreditPack {
  id: string
  label: string
  price_kobo: number
  credits: number
  is_active: boolean
  sort_order: number
}

interface BillingData {
  plan: string
  credits: number
  payments: {
    id: string
    amount_kobo: number
    credits_purchased: number
    status: string
    paystack_reference: string | null
    created_at: string | null
  }[]
  plans: DbPlan[]
  credit_packs: DbCreditPack[]
}

interface UsageRow {
  type: string
  transactions: number
  credits_used: number
}

interface CreditTransaction {
  id: string
  type: string
  amount: number
  reference: string | null
  description: string | null
  created_at: string | null
}

interface TransactionsData {
  transactions: CreditTransaction[]
  total: number
  page: number
  pages: number
}

function useBilling() {
  return useQuery<BillingData>({
    queryKey: ['billing'],
    queryFn: async () => {
      const res = await fetch('/api/billing')
      if (!res.ok) throw new Error('Failed to fetch billing data')
      return res.json()
    },
    staleTime: 30_000,
  })
}

function useUsage() {
  return useQuery<{ rows: UsageRow[]; total_used: number }>({
    queryKey: ['billing-usage'],
    queryFn: async () => {
      const res = await fetch('/api/billing/usage')
      if (!res.ok) throw new Error('Failed to fetch usage')
      return res.json()
    },
    staleTime: 60_000,
  })
}

function useTransactions(page: number, typeFilter: string) {
  return useQuery<TransactionsData>({
    queryKey: ['billing-transactions', page, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) })
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/billing/transactions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch transactions')
      return res.json()
    },
    staleTime: 30_000,
  })
}

const statusIcon = (status: string) => {
  if (status === 'success') return <CheckCircle2 size={12} className="text-green-500" />
  if (status === 'failed') return <XCircle size={12} className="text-red-500" />
  return <Clock size={12} className="text-yellow-500" />
}

const statusLabel = (status: string) => {
  if (status === 'success') return <span className="text-green-600">Success</span>
  if (status === 'failed') return <span className="text-red-500">Failed</span>
  return <span className="text-yellow-600">Pending</span>
}

const TYPE_LABELS: Record<string, string> = {
  ai_message: 'AI Messages',
  human_message: 'Human Messages',
  voice_minute: 'Voice Minutes',
  kb_embed: 'KB Documents',
  outbound_call_flat: 'Outbound Calls',
  top_up: 'Credit Top-up',
}

const TYPE_COLORS: Record<string, string> = {
  ai_message: 'bg-blue-100 text-blue-700',
  human_message: 'bg-purple-100 text-purple-700',
  voice_minute: 'bg-green-100 text-green-700',
  kb_embed: 'bg-orange-100 text-orange-700',
  outbound_call_flat: 'bg-pink-100 text-pink-700',
  top_up: 'bg-emerald-100 text-emerald-700',
}

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [txPage, setTxPage] = useState(1)
  const [txType, setTxType] = useState('')
  const { data, isLoading } = useBilling()
  const { data: usageData, isLoading: usageLoading } = useUsage()
  const { data: txData, isLoading: txLoading } = useTransactions(txPage, txType)

  const currentPlanKey = data?.plan ?? 'starter'
  const currentCredits = data?.credits ?? 0
  const dbPlans = data?.plans ?? []
  const dbPacks = data?.credit_packs ?? []
  const currentPlanObj = dbPlans.find((p) => p.key === currentPlanKey)
  const maxCredits = currentPlanObj?.credits ?? 5000
  const payments = data?.payments ?? []

  const handleTopUp = async (amountKobo: number, credits: number, label: string) => {
    setLoading(label)
    try {
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_kobo: amountKobo, credits, type: 'topup' }),
      })
      const data = await res.json()
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url
      } else {
        toast.error('Failed to initialize payment')
      }
    } catch {
      toast.error('Payment error')
    } finally {
      setLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Credits & Billing" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Credits & Billing" credits={currentCredits} />

      <main className="flex-1 p-6 space-y-6 max-w-4xl">
        {/* Current plan + credit meter */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-bold text-neutral-900">Current Plan</h3>
              <span className="text-xs font-semibold bg-violet-600 text-white px-3 py-1 rounded-full capitalize">
                {currentPlanKey}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold text-neutral-900 mb-1">
              {formatNaira(currentPlanObj?.price_kobo ?? 0)}
              <span className="text-sm font-body text-neutral-400 font-normal">/month</span>
            </p>
            <p className="text-sm text-neutral-500 mb-4">Renews automatically each month</p>
          </div>

          <CreditMeter
            credits={currentCredits}
            maxCredits={maxCredits}
            planName={currentPlanKey}
          />
        </div>

        {/* Plan upgrade cards */}
        <section>
          <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4">Plans</h3>
          {dbPlans.length === 0 ? (
            <div className="text-sm text-neutral-400 py-4">No plans configured yet.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {dbPlans.map((plan) => {
                const isCurrent = plan.key === currentPlanKey
                return (
                  <div key={plan.id} className={`rounded-xl border p-5 relative ${isCurrent ? 'border-violet-500 bg-violet-50/20' : 'border-neutral-100 bg-white shadow-sm'}`}>
                    {isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                        Current Plan
                      </span>
                    )}
                    <h4 className="font-heading font-bold text-neutral-900 mb-1">{plan.name}</h4>
                    <p className="text-xl font-heading font-bold text-neutral-900">
                      {formatNaira(plan.price_kobo)}<span className="text-sm font-body text-neutral-400 font-normal">/mo</span>
                    </p>
                    <p className="text-xs text-violet-600 mb-4">{plan.credits.toLocaleString()} credits</p>
                    <Button
                      size="sm"
                      disabled={isCurrent}
                      className="w-full rounded-full"
                      variant={isCurrent ? 'secondary' : 'default'}
                      onClick={() => !isCurrent && handleTopUp(plan.price_kobo, plan.credits, plan.name)}
                    >
                      {isCurrent ? 'Current' : 'Upgrade'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Credit top-up packs */}
        <section>
          <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4">Top-Up Credits</h3>
          {dbPacks.length === 0 ? (
            <div className="text-sm text-neutral-400 py-4">No credit packs configured yet.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {dbPacks.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handleTopUp(pack.price_kobo, pack.credits, pack.label)}
                  disabled={loading === pack.label}
                  className="flex items-center gap-3 bg-white border border-neutral-200 hover:border-violet-500 hover:bg-violet-50/20 rounded-xl px-5 py-4 transition-all disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    {loading === pack.label ? <Loader2 size={16} className="animate-spin text-violet-600" /> : <Zap size={16} className="text-violet-600" />}
                  </div>
                  <div className="text-left">
                    <p className="font-heading font-bold text-neutral-900 text-sm">{pack.credits.toLocaleString()} credits</p>
                    <p className="text-neutral-400 text-xs">{formatNaira(pack.price_kobo)} · {pack.label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Payment history */}
        <section>
          <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4">Payment History</h3>
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
            {payments.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-400">No payments yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {['Date', 'Reference', 'Amount', 'Credits', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-3 text-neutral-600">{p.created_at ? formatDate(p.created_at) : '—'}</td>
                      <td className="px-5 py-3 font-mono text-xs text-neutral-500">{p.paystack_reference ?? '—'}</td>
                      <td className="px-5 py-3 font-medium text-neutral-700">{formatNaira(p.amount_kobo)}</td>
                      <td className="px-5 py-3 text-violet-600 font-medium">+{p.credits_purchased.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-xs">
                          {statusIcon(p.status)} {statusLabel(p.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700">
                          <Receipt size={12} /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── Usage Breakdown ── */}
        <section>
          <h3 className="font-heading text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
            <TrendingDown size={15} className="text-violet-600" />
            Usage Breakdown
          </h3>
          <p className="text-xs text-neutral-400 mb-4">Credit consumption by type — current month</p>

          {usageLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !usageData?.rows.length ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm py-10 text-center text-sm text-neutral-400">
              No credit usage this month yet
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {['Type', 'Transactions', 'Credits Used', '% of Total'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {usageData.rows.map((row) => {
                    const pct = usageData.total_used > 0
                      ? Math.round((row.credits_used / usageData.total_used) * 100)
                      : 0
                    return (
                      <tr key={row.type}>
                        <td className="px-5 py-3">
                          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', TYPE_COLORS[row.type] ?? 'bg-neutral-100 text-neutral-600')}>
                            {TYPE_LABELS[row.type] ?? row.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-neutral-600">{row.transactions.toLocaleString()}</td>
                        <td className="px-5 py-3 font-medium text-neutral-800">{row.credits_used.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-neutral-100 rounded-full overflow-hidden max-w-[80px]">
                              <div className="h-full bg-violet-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-neutral-500">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="border-t border-neutral-200 bg-neutral-50">
                    <td className="px-5 py-3 text-xs font-bold text-neutral-700">Total</td>
                    <td className="px-5 py-3" />
                    <td className="px-5 py-3 font-bold text-neutral-900">{usageData.total_used.toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-neutral-500">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Credit Transaction History ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-bold text-neutral-900">Credit Transaction History</h3>
              <p className="text-xs text-neutral-400 mt-0.5">All credit deductions and top-ups</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-neutral-400" />
              <select
                value={txType}
                onChange={(e) => { setTxType(e.target.value); setTxPage(1) }}
                className="text-xs border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <option value="">All Types</option>
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {txLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !txData?.transactions.length ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm py-10 text-center text-sm text-neutral-400">
              No transactions yet
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      {['Date', 'Type', 'Reference', 'Amount', 'Balance After'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {txData.transactions.map((tx) => {
                      const isTopUp = tx.amount > 0
                      return (
                        <tr key={tx.id}>
                          <td className="px-5 py-3 text-neutral-500 text-xs">{tx.created_at ? formatDate(tx.created_at) : '—'}</td>
                          <td className="px-5 py-3">
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', TYPE_COLORS[tx.type] ?? 'bg-neutral-100 text-neutral-600')}>
                              {TYPE_LABELS[tx.type] ?? tx.type}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-neutral-400 truncate max-w-[140px]">
                            {tx.reference ?? tx.description ?? '—'}
                          </td>
                          <td className={cn('px-5 py-3 font-semibold text-sm', isTopUp ? 'text-green-600' : 'text-red-500')}>
                            {isTopUp ? '+' : ''}{tx.amount.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-neutral-500 text-xs">—</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(txData.pages ?? 1) > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-neutral-400">
                    Page {txData.page} of {txData.pages} · {txData.total.toLocaleString()} transactions
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txData.page <= 1}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setTxPage((p) => Math.min(txData.pages, p + 1))}
                      disabled={txData.page >= txData.pages}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
