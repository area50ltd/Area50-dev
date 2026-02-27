'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import {
  Search, Plus, MoreHorizontal, Building2,
  Trash2, Ban, RefreshCw, Edit2, Zap,
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
  created_at: Date
}

const PLAN_COLORS: Record<Plan, string> = {
  starter: 'bg-neutral-800 text-neutral-300',
  growth: 'bg-blue-900/50 text-blue-300',
  business: 'bg-purple-900/50 text-purple-300',
}

const SAMPLE_ORGS: Org[] = [
  { id: '1', name: 'Pinnacle Realty Lagos', email: 'support@pinnacle.ng', plan: 'growth', credits: 12450, is_active: true, ticketCount: 342, created_at: new Date(Date.now() - 86400000 * 30) },
  { id: '2', name: 'TechCorp Abuja', email: 'hello@techcorp.ng', plan: 'business', credits: 38200, is_active: true, ticketCount: 1204, created_at: new Date(Date.now() - 86400000 * 60) },
  { id: '3', name: 'QuickServe PH', email: 'info@quickserve.com', plan: 'starter', credits: 320, is_active: true, ticketCount: 87, created_at: new Date(Date.now() - 86400000 * 10) },
  { id: '4', name: 'Acme Commerce', email: 'ops@acme.ng', plan: 'starter', credits: 0, is_active: false, ticketCount: 23, created_at: new Date(Date.now() - 86400000 * 5) },
  { id: '5', name: 'Global Assist Ltd', email: 'admin@globalassist.io', plan: 'growth', credits: 4800, is_active: true, ticketCount: 589, created_at: new Date(Date.now() - 86400000 * 45) },
]

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>(SAMPLE_ORGS)
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Org | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgEmail, setNewOrgEmail] = useState('')

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (id: string) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, is_active: !o.is_active } : o)))
    const org = orgs.find((o) => o.id === id)
    toast.success(`${org?.name} ${org?.is_active ? 'disabled' : 'enabled'}`)
    setOpenMenuId(null)
  }

  const handleResetCredits = (id: string) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, credits: 1000 } : o)))
    toast.success('Credits reset to 1,000')
    setOpenMenuId(null)
  }

  const handleCreate = () => {
    if (!newOrgName || !newOrgEmail) return
    const newOrg: Org = {
      id: Date.now().toString(),
      name: newOrgName,
      email: newOrgEmail,
      plan: 'starter',
      credits: 500,
      is_active: true,
      ticketCount: 0,
      created_at: new Date(),
    }
    setOrgs((prev) => [newOrg, ...prev])
    toast.success(`${newOrgName} created`)
    setNewOrgName('')
    setNewOrgEmail('')
    setShowCreate(false)
  }

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
              className="pl-9 w-56 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 text-sm focus:border-[#E91E8C]"
            />
          </div>
          <Button
            size="sm"
            className="rounded-full gap-2"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={15} />
            Create Organization
          </Button>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
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
              {filtered.map((org) => (
                <motion.tr
                  key={org.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-neutral-800/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-white text-sm font-bold shrink-0">
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
                      {org.credits.toLocaleString()}
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
                    <span className="text-xs text-neutral-500">{formatRelativeTime(org.created_at)}</span>
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
                            <button className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5" onClick={() => { toast.info('Edit coming soon'); setOpenMenuId(null) }}>
                              <Edit2 size={14} /> Edit Details
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5" onClick={() => handleResetCredits(org.id)}>
                              <Zap size={14} /> Reset Credits
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 flex items-center gap-2.5"
                              onClick={() => handleToggle(org.id)}
                            >
                              <Ban size={14} className={org.is_active ? 'text-orange-400' : 'text-green-400'} />
                              <span className={org.is_active ? 'text-orange-300' : 'text-green-300'}>
                                {org.is_active ? 'Disable' : 'Enable'}
                              </span>
                            </button>
                            <div className="h-px bg-neutral-700 my-1" />
                            <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 flex items-center gap-2.5" onClick={() => { setDeleteTarget(org); setOpenMenuId(null) }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Create modal */}
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
                <div className="w-10 h-10 rounded-xl bg-[#E91E8C]/20 flex items-center justify-center">
                  <Building2 size={18} className="text-[#E91E8C]" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">Create Organization</h3>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Organization Name</label>
                  <Input
                    placeholder="Acme Corp"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Support Email</label>
                  <Input
                    type="email"
                    placeholder="support@acme.com"
                    value={newOrgEmail}
                    onChange={(e) => setNewOrgEmail(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 rounded-full" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button className="flex-1 rounded-full" onClick={handleCreate} disabled={!newOrgName || !newOrgEmail}>Create</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently delete the organization and all associated data. This cannot be undone."
        confirmLabel="Yes, Delete Organization"
        onConfirm={() => {
          if (!deleteTarget) return
          setOrgs((prev) => prev.filter((o) => o.id !== deleteTarget.id))
          toast.success(`${deleteTarget.name} deleted`)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  )
}
