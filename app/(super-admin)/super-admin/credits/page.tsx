'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Zap, Search, RefreshCw, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CompanyCredit {
  id: string
  name: string
  plan: string
  credits: number
}

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-neutral-800 text-neutral-300',
  growth: 'bg-blue-900 text-blue-300',
  business: 'bg-purple-900 text-purple-300',
}

async function fetchCompanies(): Promise<CompanyCredit[]> {
  const res = await fetch('/api/super-admin/companies')
  if (!res.ok) throw new Error('Failed to load')
  const data = await res.json()
  return data.companies
}

export default function SuperAdminCreditsPage() {
  const qc = useQueryClient()
  const { data: companies = [], isLoading } = useQuery({ queryKey: ['sa_companies'], queryFn: fetchCompanies })

  const [search, setSearch] = useState('')
  const [topUpTarget, setTopUpTarget] = useState<CompanyCredit | null>(null)
  const [topUpAmount, setTopUpAmount] = useState('')

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalCreditsInPlatform = companies.reduce((s, c) => s + (c.credits ?? 0), 0)
  const zeroBalanceCount = companies.filter((c) => (c.credits ?? 0) === 0).length
  const lowBalanceCount = companies.filter((c) => (c.credits ?? 0) > 0 && (c.credits ?? 0) < 500).length

  const topUpMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await fetch(`/api/super-admin/companies/${id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', amount }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      const company = companies.find((c) => c.id === id)
      toast.success(`Added ${parseInt(topUpAmount).toLocaleString()} credits to ${company?.name} — balance: ${(data.new_balance ?? 0).toLocaleString()}`)
      setTopUpTarget(null)
      setTopUpAmount('')
    },
    onError: () => toast.error('Failed to add credits'),
  })

  const resetMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/super-admin/companies/${id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      const company = companies.find((c) => c.id === id)
      toast.success(`Credits reset for ${company?.name}`)
    },
    onError: () => toast.error('Failed to reset credits'),
  })

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white mb-1">Credit Ledger</h1>
        <p className="text-neutral-500 text-sm">Manage credit balances across all organizations.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <p className="text-neutral-400 text-sm mb-3">Total Credits in Platform</p>
          <p className="font-heading text-3xl font-bold text-white">
            {isLoading ? '—' : totalCreditsInPlatform.toLocaleString()}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <p className="text-neutral-400 text-sm mb-3">Zero Balance Companies</p>
          <p className={cn('font-heading text-3xl font-bold', isLoading ? 'text-white' : zeroBalanceCount > 0 ? 'text-red-400' : 'text-white')}>
            {isLoading ? '—' : zeroBalanceCount}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <p className="text-neutral-400 text-sm mb-3">Low Balance (&lt; 500)</p>
          <p className={cn('font-heading text-3xl font-bold', isLoading ? 'text-white' : lowBalanceCount > 0 ? 'text-yellow-400' : 'text-white')}>
            {isLoading ? '—' : lowBalanceCount}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-56 text-sm bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={18} className="animate-spin text-neutral-500" />
            <span className="text-neutral-500 text-sm">Loading credit data...</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Company</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Plan</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Balance</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-neutral-600 text-sm">
                    {search ? 'No companies match your search' : 'No companies yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((company) => (
                  <motion.tr
                    key={company.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {company.name.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', PLAN_COLORS[company.plan] ?? PLAN_COLORS.starter)}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={cn(
                        'font-mono font-semibold text-sm',
                        (company.credits ?? 0) === 0 ? 'text-red-400' :
                        (company.credits ?? 0) < 500 ? 'text-yellow-400' : 'text-green-400'
                      )}>
                        {(company.credits ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 text-xs rounded-lg text-violet-600 hover:bg-violet-600/10 gap-1.5"
                          onClick={() => setTopUpTarget(company)}
                        >
                          <Plus size={12} />
                          Add Credits
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 text-xs rounded-lg text-neutral-400 hover:bg-neutral-800 gap-1.5"
                          onClick={() => resetMutation.mutate(company.id)}
                          disabled={resetMutation.isPending}
                        >
                          <RefreshCw size={12} className={resetMutation.isPending ? 'animate-spin' : ''} />
                          Reset
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Top-up modal */}
      {topUpTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setTopUpTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                <Zap size={18} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-white font-bold">Add Credits</h3>
                <p className="text-neutral-400 text-xs">{topUpTarget.name}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Credit Amount</label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600"
                autoFocus
              />
              <p className="text-xs text-neutral-600 mt-1.5">
                Current balance: <span className="text-neutral-400">{(topUpTarget.credits ?? 0).toLocaleString()} credits</span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 text-neutral-400 hover:text-white border border-neutral-700 rounded-full"
                onClick={() => setTopUpTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full gap-2"
                onClick={() => topUpMutation.mutate({ id: topUpTarget.id, amount: parseInt(topUpAmount) })}
                disabled={!topUpAmount || topUpMutation.isPending}
              >
                {topUpMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Add Credits
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
