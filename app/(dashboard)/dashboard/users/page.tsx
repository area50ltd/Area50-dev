'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import {
  type LucideIcon,
  UserPlus, Link2, Search, MoreHorizontal,
  ShieldCheck, UserCog, User, Headphones,
  Wrench, Mail, Trash2, Ban, RefreshCw, Loader2, CheckCircle2,
} from 'lucide-react'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type UserRole = 'admin' | 'agent' | 'customer' | 'maintenance'

interface TeamUser {
  id: string
  name: string | null
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  admin: ShieldCheck,
  agent: Headphones,
  customer: User,
  maintenance: Wrench,
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-purple-700 bg-purple-50 border-purple-200',
  agent: 'text-blue-700 bg-blue-50 border-blue-200',
  customer: 'text-neutral-700 bg-neutral-50 border-neutral-200',
  maintenance: 'text-orange-700 bg-orange-50 border-orange-200',
}

const ADD_USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'agent', label: 'Agent' },
  { value: 'maintenance', label: 'Maintenance' },
]

async function fetchUsers(): Promise<TeamUser[]> {
  const res = await fetch('/api/users')
  if (!res.ok) throw new Error('Failed to load users')
  const data = await res.json()
  return data.users
}

export default function UsersPage() {
  const qc = useQueryClient()
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['team_users'],
    queryFn: fetchUsers,
  })

  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamUser | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('agent')

  const filtered = users.filter(
    (u) =>
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  // ── Mutations ─────────────────────────────────────────────────────────────

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to update role')
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team_users'] })
      toast.success('Role updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const suspendMutation = useMutation({
    mutationFn: async (user: TeamUser) => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return user
    },
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ['team_users'] })
      toast.success(`${user.name ?? user.email} ${user.is_active ? 'suspended' : 'reactivated'}`)
      setOpenMenuId(null)
    },
    onError: () => toast.error('Failed to update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to delete user')
      }
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['team_users'] })
      const user = users.find((u) => u.id === id)
      toast.success(`${user?.name ?? user?.email} removed`)
      setDeleteTarget(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleCopyInviteLink = () => {
    const url = `${window.location.origin}/onboarding`
    navigator.clipboard.writeText(url)
    toast.success('Invite link copied! Share it with your team member.')
  }

  const handleSendInvite = () => {
    if (!inviteEmail) return
    // Future: call Clerk Invitations API
    toast.success(`Invite sent to ${inviteEmail} — they can sign up at /onboarding`)
    setInviteEmail('')
    setShowInviteModal(false)
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Users & Roles" />

      <main className="flex-1 p-6">
        <div className="max-w-4xl">
          {/* Actions bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full gap-2" onClick={() => setShowInviteModal(true)}>
                <UserPlus size={15} />
                Add User
              </Button>
              <Button variant="secondary" size="sm" className="rounded-full gap-2" onClick={handleCopyInviteLink}>
                <Link2 size={15} />
                Copy Invite Link
              </Button>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-56 text-sm"
              />
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(['admin', 'agent', 'maintenance', 'customer'] as UserRole[]).map((role) => {
              const roleCount = users.filter((u) => u.role === role).length
              const Icon = ROLE_ICONS[role]
              return (
                <div key={role} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-50 flex items-center justify-center">
                    <Icon size={18} className="text-[#1B2A4A]" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#1B2A4A]">
                      {isLoading ? '—' : roleCount}
                    </p>
                    <p className="text-xs text-neutral-500 capitalize">{role}s</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <Loader2 size={18} className="animate-spin text-neutral-400" />
                <span className="text-neutral-400 text-sm">Loading users...</span>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Joined</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  <AnimatePresence>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-14 text-center text-neutral-400 text-sm">
                          {search ? 'No users match your search' : 'No team members yet — invite someone to get started'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => {
                        const Icon = ROLE_ICONS[user.role as UserRole] ?? User
                        return (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-neutral-50 transition-colors"
                          >
                            {/* User */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#243460] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {getInitials(user.name ?? user.email)}
                                </div>
                                <div>
                                  <p className="font-medium text-[#1B2A4A]">{user.name ?? '—'}</p>
                                  <p className="text-xs text-neutral-400">{user.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={user.role}
                                  onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value as UserRole })}
                                  className={cn(
                                    'text-xs font-medium border rounded-full px-2.5 py-1 focus:outline-none cursor-pointer',
                                    ROLE_COLORS[user.role as UserRole] ?? ROLE_COLORS.customer
                                  )}
                                >
                                  {ADD_USER_ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                  ))}
                                </select>
                                <Icon size={13} className="text-neutral-400" />
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <span className={cn(
                                'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                                user.is_active
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              )}>
                                <div className={cn('w-1.5 h-1.5 rounded-full', user.is_active ? 'bg-green-500' : 'bg-red-500')} />
                                {user.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>

                            {/* Joined */}
                            <td className="px-4 py-4">
                              <span className="text-xs text-neutral-500">
                                {formatRelativeTime(new Date(user.created_at))}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4">
                              <div className="relative flex justify-end">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                  className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500"
                                >
                                  <MoreHorizontal size={16} />
                                </button>
                                <AnimatePresence>
                                  {openMenuId === user.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                      className="absolute right-0 top-8 bg-white border border-neutral-100 shadow-lg rounded-xl py-1.5 z-10 min-w-[160px]"
                                    >
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5"
                                        onClick={() => {
                                          toast.info('Password reset is managed via Clerk — users can reset at /login')
                                          setOpenMenuId(null)
                                        }}
                                      >
                                        <RefreshCw size={14} />
                                        Reset Password
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5"
                                        onClick={() => { toast.info('Login history coming soon'); setOpenMenuId(null) }}
                                      >
                                        <UserCog size={14} />
                                        Login History
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2.5"
                                        onClick={() => suspendMutation.mutate(user)}
                                      >
                                        {user.is_active ? (
                                          <><Ban size={14} className="text-orange-500" /><span className="text-orange-600">Suspend</span></>
                                        ) : (
                                          <><CheckCircle2 size={14} className="text-green-500" /><span className="text-green-600">Reactivate</span></>
                                        )}
                                      </button>
                                      <div className="h-px bg-neutral-100 my-1" />
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                                        onClick={() => { setDeleteTarget(user); setOpenMenuId(null) }}
                                      >
                                        <Trash2 size={14} />
                                        Delete User
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Invite modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-[#1B2A4A] mb-1">Invite Team Member</h3>
              <p className="text-sm text-neutral-500 mb-5">They will sign up at /onboarding and be linked to your company.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm bg-white"
                  >
                    {ADD_USER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" className="flex-1 rounded-full" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-full" onClick={handleSendInvite} disabled={!inviteEmail}>
                  Send Invite
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove ${deleteTarget?.name ?? deleteTarget?.email}?`}
        description="This will permanently remove this user from your organization. Their tickets will remain."
        confirmLabel="Yes, Remove User"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
