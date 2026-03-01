'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { TopBar } from '@/components/dashboard/TopBar'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { Button } from '@/components/ui/button'
import { PLANS, CREDIT_PACKS } from '@/lib/constants'
import { formatNaira, formatDate } from '@/lib/utils'
import { Zap, CheckCircle2, Receipt } from 'lucide-react'

// Mock data — in production from DB
const CURRENT_PLAN = 'growth'
const CURRENT_CREDITS = 8_420
const MAX_CREDITS = PLANS.growth.credits

const PAYMENT_HISTORY = [
  { date: '2026-02-01', ref: 'PAY-001', amount: 3_500_000, credits: 15_000, status: 'success' },
  { date: '2026-01-15', ref: 'PAY-002', amount: 1_000_000, credits: 3_500, status: 'success' },
  { date: '2025-12-01', ref: 'PAY-003', amount: 3_500_000, credits: 15_000, status: 'success' },
]

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Credits & Billing" credits={CURRENT_CREDITS} />

      <main className="flex-1 p-6 space-y-6 max-w-4xl">
        {/* Current plan + credit meter */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-bold text-[#1B2A4A]">Current Plan</h3>
              <span className="text-xs font-semibold bg-[#E91E8C] text-white px-3 py-1 rounded-full capitalize">
                {CURRENT_PLAN}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold text-[#1B2A4A] mb-1">
              {formatNaira(PLANS[CURRENT_PLAN as keyof typeof PLANS].price_kobo)}
              <span className="text-sm font-body text-neutral-400 font-normal">/month</span>
            </p>
            <p className="text-sm text-neutral-500 mb-4">Renews on March 1, 2026</p>
          </div>

          <CreditMeter
            credits={CURRENT_CREDITS}
            maxCredits={MAX_CREDITS}
            planName={CURRENT_PLAN}
          />
        </div>

        {/* Plan upgrade cards */}
        <section>
          <h3 className="font-heading text-sm font-bold text-[#1B2A4A] mb-4">Plans</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = key === CURRENT_PLAN
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
                  <Zap size={16} className="text-[#E91E8C]" />
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {['Date', 'Reference', 'Amount', 'Credits', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {PAYMENT_HISTORY.map((p) => (
                  <tr key={p.ref}>
                    <td className="px-5 py-3 text-neutral-600">{formatDate(p.date)}</td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-500">{p.ref}</td>
                    <td className="px-5 py-3 font-medium text-neutral-700">{formatNaira(p.amount)}</td>
                    <td className="px-5 py-3 text-[#E91E8C] font-medium">+{p.credits.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-green-600">
                        <CheckCircle2 size={12} /> Success
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
          </div>
        </section>
      </main>
    </div>
  )
}
