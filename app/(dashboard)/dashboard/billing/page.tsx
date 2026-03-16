'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TopBar } from '@/components/dashboard/TopBar'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { Button } from '@/components/ui/button'
import { formatUSD, formatDate, cn } from '@/lib/utils'
import {
  Zap,
  Check,
  Minus,
  CheckCircle2,
  Receipt,
  Loader2,
  Clock,
  XCircle,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  Users,
  BookOpen,
  Phone,
  BarChart2,
  Shield,
  Star,
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
  admin_reset: 'bg-neutral-100 text-neutral-600',
}

// Features per plan — only features actually built in the app
const PLAN_FEATURES: Record<string, { label: string; icon: React.ElementType }[]> = {
  starter: [
    { label: 'Web chat widget', icon: MessageSquare },
    { label: 'Custom brand colors & avatar', icon: Shield },
    { label: 'Ticket tracking', icon: Check },
    { label: 'AI + human handoff', icon: Check },
    { label: 'Sentiment & complexity scoring', icon: Check },
    { label: 'Smart ticket routing', icon: Check },
    { label: '1 human agent seat', icon: Users },
    { label: '10 knowledge base documents', icon: BookOpen },
    { label: 'Basic analytics', icon: BarChart2 },
    { label: 'Email support', icon: Check },
  ],
  growth: [
    { label: 'Everything in Starter', icon: Check },
    { label: 'Custom AI personality', icon: Star },
    { label: 'Voice calls (inbound + outbound)', icon: Phone },
    { label: '5 human agent seats', icon: Users },
    { label: '50 knowledge base documents', icon: BookOpen },
    { label: 'Advanced analytics', icon: BarChart2 },
    { label: 'Business hours configuration', icon: Check },
    { label: 'Priority email support', icon: Check },
  ],
  business: [
    { label: 'Everything in Growth', icon: Check },
    { label: 'Unlimited agent seats', icon: Users },
    { label: 'Unlimited knowledge base docs', icon: BookOpen },
    { label: 'Custom analytics reports', icon: BarChart2 },
    { label: 'Dedicated account manager', icon: Check },
    { label: 'SLA guarantee', icon: Shield },
    { label: 'Guided onboarding', icon: Check },
  ],
  agency: [
    { label: 'Everything in Business', icon: Check },
    { label: 'Higher volume capacity', icon: Zap },
    { label: 'Priority onboarding', icon: Star },
    { label: 'Multi-account management', icon: Users },
    { label: 'Dedicated support manager', icon: Check },
  ],
}

const PLAN_DESCRIPTIONS: Record<string, string> = {
  starter: 'Solo operators and small teams getting started with AI support.',
  growth: 'Growing businesses that need voice calls and more capacity.',
  business: 'Established teams needing full control and unlimited scale.',
  agency: 'High-volume operations managing multiple client accounts.',
}

const PLAN_HIGHLIGHTED: Record<string, boolean> = {
  starter: false,
  growth: true,
  business: false,
  agency: false,
}

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [txPage, setTxPage] = useState(1)
  const [txType, setTxType] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data, isLoading } = useBilling()
  const { data: usageData, isLoading: usageLoading } = useUsage()
  const { data: txData, isLoading: txLoading } = useTransactions(txPage, txType)

  // Handle Paystack redirect callback: /dashboard/billing?payment=verify&reference=xxx
  useEffect(() => {
    const payment = searchParams.get('payment')
    const reference = searchParams.get('reference') ?? searchParams.get('trxref')
    if (payment !== 'verify' || !reference) return

    // Clean the URL immediately so refresh doesn't re-trigger
    router.replace('/dashboard/billing')

    fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          toast.success(`Payment verified! ${result.credits_added?.toLocaleString() ?? ''} credits added.`)
          queryClient.invalidateQueries({ queryKey: ['billing'] })
          queryClient.invalidateQueries({ queryKey: ['billing-transactions'] })
          queryClient.invalidateQueries({ queryKey: ['billing-usage'] })
        } else {
          toast.error(result.message ?? 'Payment could not be verified. Contact support if credits were deducted.')
        }
      })
      .catch(() => toast.error('Verification request failed. Please contact support.'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentPlanKey = data?.plan ?? 'starter'
  const currentCredits = data?.credits ?? 0
  const dbPlans = data?.plans ?? []
  const dbPacks = data?.credit_packs ?? []
  const currentPlanObj = dbPlans.find((p) => p.key === currentPlanKey)
  const maxCredits = currentPlanObj?.credits ?? 5000
  const payments = data?.payments ?? []

  const handleTopUp = async (amountCents: number, credits: number, label: string) => {
    setLoading(label)
    try {
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_kobo: amountCents, credits, type: 'topup' }),
      })
      const data = await res.json()
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url
      } else {
        toast.error(data.error ?? data.message ?? 'Failed to initialize payment')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment error')
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

      <main className="flex-1 p-6 space-y-8 max-w-5xl">

        {/* ── Current plan + credit meter ── */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-neutral-900">Current Plan</h3>
              <span className="text-xs font-semibold bg-violet-600 text-white px-3 py-1 rounded-full capitalize">
                {currentPlanKey}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold text-neutral-900 mb-0.5">
              {formatUSD(currentPlanObj?.price_kobo ?? 0)}
              <span className="text-sm font-body text-neutral-400 font-normal">/month</span>
            </p>
            <p className="text-xs text-neutral-400">
              {(currentPlanObj?.credits ?? maxCredits).toLocaleString()} credits included per month
            </p>
          </div>

          <CreditMeter
            credits={currentCredits}
            maxCredits={maxCredits}
            planName={currentPlanKey}
          />
        </div>

        {/* ── Plan cards ── */}
        <section>
          <div className="mb-5">
            <h3 className="font-heading text-sm font-bold text-neutral-900">Plans</h3>
            <p className="text-xs text-neutral-400 mt-0.5">All plans are billed monthly. Upgrade or downgrade anytime.</p>
          </div>

          {dbPlans.length === 0 ? (
            <div className="text-sm text-neutral-400 py-4">No plans configured yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {dbPlans.map((plan) => {
                const isCurrent = plan.key === currentPlanKey
                const isHighlighted = PLAN_HIGHLIGHTED[plan.key] ?? false
                const features = PLAN_FEATURES[plan.key] ?? []
                const description = PLAN_DESCRIPTIONS[plan.key] ?? ''

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'rounded-xl border flex flex-col relative',
                      isCurrent
                        ? 'border-violet-500 bg-white ring-1 ring-violet-500/20 shadow-md'
                        : isHighlighted
                          ? 'border-violet-200 bg-violet-50/30 shadow-sm'
                          : 'border-neutral-200 bg-white shadow-sm',
                    )}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          Current Plan
                        </span>
                      </div>
                    )}
                    {!isCurrent && isHighlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-neutral-800 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-5 border-b border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">{plan.name}</p>
                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-2xl font-heading font-bold text-neutral-900">{formatUSD(plan.price_kobo)}</span>
                        <span className="text-xs text-neutral-400 mb-1">/mo</span>
                      </div>
                      <p className="text-xs text-violet-600 font-semibold mb-2">{plan.credits.toLocaleString()} credits/mo</p>
                      <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
                    </div>

                    <div className="p-5 flex-1">
                      <ul className="space-y-2">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                            <Check size={12} className="text-violet-500 flex-shrink-0 mt-0.5" />
                            {f.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="px-5 pb-5">
                      <Button
                        size="sm"
                        disabled={isCurrent || loading === plan.name}
                        className="w-full rounded-lg text-xs"
                        variant={isCurrent ? 'secondary' : 'default'}
                        onClick={() => !isCurrent && handleTopUp(plan.price_kobo, plan.credits, plan.name)}
                      >
                        {loading === plan.name
                          ? <Loader2 size={13} className="animate-spin" />
                          : isCurrent
                            ? 'Current Plan'
                            : 'Upgrade'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Credit cost reference ── */}
        <section>
          <h3 className="font-heading text-sm font-bold text-neutral-900 mb-3">Credit Cost Reference</h3>
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {['Operation', 'Cost', 'Notes'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {[
                  { op: 'AI message reply', cost: '1 credit', note: 'Each AI response to a customer.' },
                  { op: 'Human agent message', cost: '3 credits', note: 'Agent responses cost 3× AI. Encourage AI resolution.' },
                  { op: 'Voice call', cost: '10 credits/min', note: 'A 5-min call = 50 credits.' },
                  { op: 'Knowledge base embedding', cost: '5 credits', note: 'One-time per document upload. Not charged per query.' },
                  { op: 'Outbound call (flat fee)', cost: '5 credits', note: 'Flat per outbound call, regardless of duration.' },
                ].map((row) => (
                  <tr key={row.op}>
                    <td className="px-5 py-3 font-medium text-neutral-800 text-xs">{row.op}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                        {row.cost}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-400">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Credit top-up packs ── */}
        <section>
          <div className="mb-3">
            <h3 className="font-heading text-sm font-bold text-neutral-900">Top-Up Credits</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Need more credits before your next billing cycle? Purchase a pack instantly.</p>
          </div>
          {dbPacks.length === 0 ? (
            <div className="text-sm text-neutral-400 py-4">No credit packs configured yet.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {dbPacks.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handleTopUp(pack.price_kobo, pack.credits, pack.label)}
                  disabled={loading === pack.label}
                  className="flex items-center gap-3 bg-white border border-neutral-200 hover:border-violet-400 hover:bg-violet-50/30 rounded-xl px-5 py-4 transition-all disabled:opacity-50 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                    {loading === pack.label
                      ? <Loader2 size={15} className="animate-spin text-violet-600" />
                      : <Zap size={15} className="text-violet-600" />
                    }
                  </div>
                  <div>
                    <p className="font-heading font-bold text-neutral-900 text-sm">{pack.credits.toLocaleString()} credits</p>
                    <p className="text-neutral-400 text-xs">{formatUSD(pack.price_kobo)} one-time · {pack.label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Payment history ── */}
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
                      <td className="px-5 py-3 font-medium text-neutral-700">{formatUSD(p.amount_kobo)}</td>
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
                      {['Date', 'Type', 'Reference', 'Credits'].map((h) => (
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
                          <td className="px-5 py-3 font-mono text-xs text-neutral-400 truncate max-w-[160px]">
                            {tx.description ?? tx.reference ?? '—'}
                          </td>
                          <td className={cn('px-5 py-3 font-semibold text-sm', isTopUp ? 'text-green-600' : 'text-red-500')}>
                            {isTopUp ? '+' : ''}{tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

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
