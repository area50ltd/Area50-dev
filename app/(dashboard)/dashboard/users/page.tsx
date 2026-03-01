'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import {
  type LucideIcon,
  UserPlus, Link2, Search, MoreHorizontal,
  ShieldCheck, UserCog, User, Headphones,
  Wrench, Mail, Trash2, Ban, RefreshCw,
} from 'lucide-react'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type UserRole = 'admin' | 'agent' | 'customer' | 'maintenance'

interface TeamUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'suspended'
  lastLogin: Date | null
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

const SAMPLE_USERS: TeamUser[] = [
  { id: '1', name: 'Amara Okonkwo', email: 'amara@mycompany.com', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 3600000) },
  { id: '2', name: 'Chidi Eze', email: 'chidi@mycompany.com', role: 'agent', status: 'active', lastLogin: new Date(Date.now() - 900000) },
  { id: '3', name: 'Ngozi Adeyemi', email: 'ngozi@mycompany.com', role: 'agent', status: 'active', lastLogin: new Date(Date.now() - 86400000) },
  { id: '4', name: 'Emeka Bello', email: 'emeka@mycompany.com', role: 'maintenance', status: 'active', lastLogin: new Date(Date.now() - 7200000) },
  { id: '5', name: 'Fatima Garba', email: 'fatima@mycompany.com', role: 'agent', status: 'suspended', lastLogin: new Date(Date.now() - 604800000) },
]

const ADD_USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'agent', label: 'Agent' },
  { value: 'maintenance', label: 'Maintenance' },
]

export default function UsersPage() {
  const [users, setUsers] = useState<TeamUser[]>(SAMPLE_USERS)
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamUser | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('agent')

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    toast.success('Role updated')
  }

  const handleSuspend = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    )
    const user = users.find((u) => u.id === id)
    toast.success(`${user?.name} ${user?.status === 'active' ? 'suspended' : 'reactivated'}`)
    setOpenMenuId(null)
  }

  const handleDelete = (user: TeamUser) => {
    setDeleteTarget(user)
    setOpenMenuId(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
    toast.success(`${deleteTarget.name} removed`)
    setDeleteTarget(null)
  }

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`https://app.yourdomain.com/invite?token=demo_token`)
    toast.success('Invite link copied!')
  }

  const handleSendInvite = () => {
    if (!inviteEmail) return
    toast.success(`Invite sent to ${inviteEmail}`)
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
              <Button
                size="sm"
                className="rounded-full gap-2"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus size={15} />
                Add User
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full gap-2"
                onClick={handleCopyInviteLink}
              >
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
              const count = users.filter((u) => u.role === role).length
              const Icon = ROLE_ICONS[role]
              return (
                <div key={role} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-50 flex items-center justify-center">
                    <Icon size={18} className="text-[#1B2A4A]" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#1B2A4A]">{count}</p>
                    <p className="text-xs text-neutral-500 capitalize">{role}s</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Last Login</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                <AnimatePresence>
                  {filtered.map((user) => {
                    const Icon = ROLE_ICONS[user.role]
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
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className="font-medium text-[#1B2A4A]">{user.name}</p>
                              <p className="text-xs text-neutral-400">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                              className={cn(
                                'text-xs font-medium border rounded-full px-2.5 py-1 focus:outline-none cursor-pointer',
                                ROLE_COLORS[user.role]
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
                            user.status === 'active'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          )}>
                            <div className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                            )} />
                            {user.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td className="px-4 py-4">
                          <span className="text-xs text-neutral-500">
                            {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
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
                                    onClick={() => { toast.info('Password reset email sent'); setOpenMenuId(null) }}
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
                                    onClick={() => handleSuspend(user.id)}
                                  >
                                    <Ban size={14} className={user.status === 'active' ? 'text-orange-500' : 'text-green-500'} />
                                    <span className={user.status === 'active' ? 'text-orange-600' : 'text-green-600'}>
                                      {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                                    </span>
                                  </button>
                                  <div className="h-px bg-neutral-100 my-1" />
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                                    onClick={() => handleDelete(user)}
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
                  })}
                </AnimatePresence>
              </tbody>
            </table>
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
              <p className="text-sm text-neutral-500 mb-5">They will receive an email with a link to join.</p>

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
                <Button
                  variant="secondary"
                  className="flex-1 rounded-full"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  onClick={handleSendInvite}
                  disabled={!inviteEmail}
                >
                  Send Invite
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove ${deleteTarget?.name}?`}
        description="This will permanently remove this user from your organization. Their tickets will remain."
        confirmLabel="Yes, Remove User"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
