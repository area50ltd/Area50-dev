'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import {
  Search, Plus, MoreHorizontal, Building2,
  Trash2, Ban, RefreshCw, Edit2, Zap, CheckCircle2, Loader2,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type Plan = 'starter' | 'growth' | 'business'

interface Org {
  id: string
  name: string
  email: string
  plan: Plan
  credits: number
  is_active: boolean
  ticketCount: number
  created_at: string
}

const PLAN_COLORS: Record<Plan, string> = {
  starter: 'bg-neutral-800 text-neutral-300',
  growth: 'bg-blue-900/50 text-blue-300',
  business: 'bg-purple-900/50 text-purple-300',
}

const PLANS: Plan[] = ['starter', 'growth', 'business']

async function fetchCompanies(): Promise<Org[]> {
  const res = await fetch('/api/super-admin/companies')
  if (!res.ok) throw new Error('Failed to load organizations')
  const data = await res.json()
  return data.companies
}

export default function OrganizationsPage() {
  const qc = useQueryClient()
  const { data: orgs = [], isLoading } = useQuery({ queryKey: ['sa_companies'], queryFn: fetchCompanies })

  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Org | null>(null)

  // Create modal state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPlan, setNewPlan] = useState<Plan>('starter')
  const [newCredits, setNewCredits] = useState('500')

  // Edit modal state
  const [editTarget, setEditTarget] = useState<Org | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPlan, setEditPlan] = useState<Plan>('starter')

  // Credit top-up modal state
  const [creditTarget, setCreditTarget] = useState<Org | null>(null)
  const [creditAmount, setCreditAmount] = useState('')

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  )

  // ── Mutations ─────────────────────────────────────────────────────────────

  const toggleMutation = useMutation({
    mutationFn: async (org: Org) => {
      const res = await fetch(`/api/super-admin/companies/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !org.is_active }),
      })
      if (!res.ok) throw new Error('Failed to update')
    },
    onSuccess: (_, org) => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      toast.success(`${org.name} ${org.is_active ? 'disabled' : 'enabled'}`)
      setOpenMenuId(null)
    },
    onError: () => toast.error('Failed to update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/super-admin/companies/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      const org = orgs.find((o) => o.id === id)
      toast.success(`${org?.name} deleted`)
      setDeleteTarget(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/super-admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, plan: newPlan, credits: parseInt(newCredits) || 500 }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to create')
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      toast.success(`${newName} created`)
      setNewName(''); setNewEmail(''); setNewPlan('starter'); setNewCredits('500')
      setShowCreate(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editTarget) return
      const res = await fetch(`/api/super-admin/companies/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail, plan: editPlan }),
      })
      if (!res.ok) throw new Error('Failed to update')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      toast.success('Organization updated')
      setEditTarget(null)
    },
    onError: () => toast.error('Update failed'),
  })

  const creditsMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await fetch(`/api/super-admin/companies/${id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', amount }),
      })
      if (!res.ok) throw new Error('Failed to add credits')
      return res.json()
    },
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      const org = orgs.find((o) => o.id === id)
      toast.success(`Credits added to ${org?.name} — new balance: ${(data.new_balance ?? 0).toLocaleString()}`)
      setCreditTarget(null)
      setCreditAmount('')
    },
    onError: () => toast.error('Failed to add credits'),
  })

  const resetCreditsMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/super-admin/companies/${id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      if (!res.ok) throw new Error('Failed to reset credits')
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['sa_companies'] })
      const org = orgs.find((o) => o.id === id)
      toast.success(`Credits reset for ${org?.name}`)
      setOpenMenuId(null)
    },
    onError: () => toast.error('Failed to reset credits'),
  })

  return (
    <main className="flex-1 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Organizations</h1>
          <p className="text-neutral-500 text-sm">{orgs.length} companies on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-56 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 text-sm focus:border-violet-600"
            />
          </div>
          <Button size="sm" className="rounded-full gap-2" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Create Organization
          </Button>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={18} className="animate-spin text-neutral-500" />
            <span className="text-neutral-500 text-sm">Loading organizations...</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Organization</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Credits</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Tickets</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-neutral-600 text-sm">
                      {search ? 'No organizations match your search' : 'No organizations yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((org) => (
                    <motion.tr
                      key={org.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{org.name}</p>
                            <p className="text-xs text-neutral-500">{org.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', PLAN_COLORS[org.plan])}>
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'text-sm font-medium',
                          org.credits <= 0 ? 'text-red-400' : org.credits < 500 ? 'text-orange-400' : 'text-white'
                        )}>
                          {(org.credits ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-neutral-300">{org.ticketCount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                          org.is_active ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full', org.is_active ? 'bg-green-400' : 'bg-red-400')} />
                          {org.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-neutral-500">{formatRelativeTime(new Date(org.created_at))}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative flex justify-end">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === org.id ? null : org.id)}
                            className="p-1.5 rounded-lg hover:bg-neutral-700 transition-colors text-neutral-500 hover:text-white"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          <AnimatePresence>
                            {openMenuId === org.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                className="absolute right-0 top-8 bg-neutral-800 border border-neutral-700 shadow-xl rounded-xl py-1.5 z-10 min-w-[180px]"
                              >
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5"
                                  onClick={() => {
                                    setEditTarget(org)
                                    setEditName(org.name)
                                    setEditEmail(org.email)
                                    setEditPlan(org.plan)
                                    setOpenMenuId(null)
                                  }}
                                >
                                  <Edit2 size={14} /> Edit Details
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5"
                                  onClick={() => {
                                    setCreditTarget(org)
                                    setOpenMenuId(null)
                                  }}
                                >
                                  <Zap size={14} className="text-violet-600" /> Add Credits
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5"
                                  onClick={() => resetCreditsMutation.mutate(org.id)}
                                >
                                  <RefreshCw size={14} /> Reset Credits
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 flex items-center gap-2.5"
                                  onClick={() => toggleMutation.mutate(org)}
                                >
                                  {org.is_active ? (
                                    <><Ban size={14} className="text-orange-400" /><span className="text-orange-300">Disable</span></>
                                  ) : (
                                    <><CheckCircle2 size={14} className="text-green-400" /><span className="text-green-300">Enable</span></>
                                  )}
                                </button>
                                <div className="h-px bg-neutral-700 my-1" />
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 flex items-center gap-2.5"
                                  onClick={() => { setDeleteTarget(org); setOpenMenuId(null) }}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                  <Building2 size={18} className="text-violet-600" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">Create Organization</h3>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Organization Name</label>
                  <Input
                    placeholder="Acme Corp"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Support Email</label>
                  <Input
                    type="email"
                    placeholder="support@acme.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Plan</label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as Plan)}
                      className="w-full h-9 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 text-sm focus:outline-none focus:border-violet-600"
                    >
                      {PLANS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Starting Credits</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={newCredits}
                      onChange={(e) => setNewCredits(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 rounded-full" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button
                  className="flex-1 rounded-full gap-2"
                  onClick={() => createMutation.mutate()}
                  disabled={!newName || !newEmail || createMutation.isPending}
                >
                  {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Create
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setEditTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Edit2 size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Edit Organization</h3>
                  <p className="text-neutral-500 text-xs">{editTarget.name}</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Email</label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Plan</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as Plan)}
                    className="w-full h-9 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 text-sm focus:outline-none focus:border-violet-600"
                  >
                    {PLANS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 rounded-full" onClick={() => setEditTarget(null)}>Cancel</Button>
                <Button
                  className="flex-1 rounded-full gap-2"
                  onClick={() => editMutation.mutate()}
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Credits modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {creditTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCreditTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                  <Zap size={18} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Add Credits</h3>
                  <p className="text-neutral-400 text-xs">{creditTarget.name}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Credit Amount</label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600"
                  autoFocus
                />
                <p className="text-xs text-neutral-600 mt-1.5">
                  Current balance: <span className="text-neutral-400">{(creditTarget.credits ?? 0).toLocaleString()} credits</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 text-neutral-400 hover:text-white border border-neutral-700 rounded-full" onClick={() => setCreditTarget(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-full gap-2"
                  onClick={() => creditsMutation.mutate({ id: creditTarget.id, amount: parseInt(creditAmount) })}
                  disabled={!creditAmount || creditsMutation.isPending}
                >
                  {creditsMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Add Credits
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm delete ───────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently delete the organization and all associated data. This cannot be undone."
        confirmLabel="Yes, Delete Organization"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  )
}
