'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TopBar } from '@/components/dashboard/TopBar'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { Button } from '@/components/ui/button'
import { PLANS, CREDIT_PACKS } from '@/lib/constants'
import { formatNaira, formatDate } from '@/lib/utils'
import { Zap, CheckCircle2, Receipt, Loader2, Clock, XCircle } from 'lucide-react'

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

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const { data, isLoading } = useBilling()

  const currentPlan = (data?.plan ?? 'starter') as keyof typeof PLANS
  const currentCredits = data?.credits ?? 0
  const maxCredits = PLANS[currentPlan]?.credits ?? PLANS.starter.credits
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
              <h3 className="font-heading text-sm font-bold text-[#1B2A4A]">Current Plan</h3>
              <span className="text-xs font-semibold bg-[#E91E8C] text-white px-3 py-1 rounded-full capitalize">
                {currentPlan}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold text-[#1B2A4A] mb-1">
              {formatNaira(PLANS[currentPlan]?.price_kobo ?? PLANS.starter.price_kobo)}
              <span className="text-sm font-body text-neutral-400 font-normal">/month</span>
            </p>
            <p className="text-sm text-neutral-500 mb-4">Renews automatically each month</p>
          </div>

          <CreditMeter
            credits={currentCredits}
            maxCredits={maxCredits}
            planName={currentPlan}
          />
        </div>

        {/* Plan upgrade cards */}
        <section>
          <h3 className="font-heading text-sm font-bold text-[#1B2A4A] mb-4">Plans</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = key === currentPlan
              return (
                <div key={key} className={`rounded-xl border p-5 relative ${isCurrent ? 'border-[#E91E8C] bg-[#FDE7F3]/20' : 'border-neutral-100 bg-white shadow-sm'}`}>
                  {isCurrent && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#E91E8C] text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                      Current Plan
                    </span>
                  )}
                  <h4 className="font-heading font-bold text-[#1B2A4A] mb-1">{plan.name}</h4>
                  <p className="text-xl font-heading font-bold text-[#1B2A4A]">
                    {formatNaira(plan.price_kobo)}<span className="text-sm font-body text-neutral-400 font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-[#E91E8C] mb-4">{plan.credits.toLocaleString()} credits</p>
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
        </section>

        {/* Credit top-up packs */}
        <section>
          <h3 className="font-heading text-sm font-bold text-[#1B2A4A] mb-4">Top-Up Credits</h3>
          <div className="flex flex-wrap gap-3">
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.label}
                onClick={() => handleTopUp(pack.price_kobo, pack.credits, pack.label)}
                disabled={loading === pack.label}
                className="flex items-center gap-3 bg-white border border-neutral-200 hover:border-[#E91E8C] hover:bg-[#FDE7F3]/20 rounded-xl px-5 py-4 transition-all disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FDE7F3] flex items-center justify-center">
                  {loading === pack.label ? <Loader2 size={16} className="animate-spin text-[#E91E8C]" /> : <Zap size={16} className="text-[#E91E8C]" />}
                </div>
                <div className="text-left">
                  <p className="font-heading font-bold text-[#1B2A4A] text-sm">{pack.credits.toLocaleString()} credits</p>
                  <p className="text-neutral-400 text-xs">{formatNaira(pack.price_kobo)} · {pack.label}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Payment history */}
        <section>
          <h3 className="font-heading text-sm font-bold text-[#1B2A4A] mb-4">Payment History</h3>
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
                      <td className="px-5 py-3 text-[#E91E8C] font-medium">+{p.credits_purchased.toLocaleString()}</td>
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
      </main>
    </div>
  )
}
