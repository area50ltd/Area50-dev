'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, ToggleLeft, ToggleRight, Users, X, Plus } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { AgentCard } from '@/components/dashboard/AgentCard'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from '@/hooks/useAgents'
import type { Agent, User } from '@/lib/types'

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  max_concurrent_chats: z.coerce.number().int().min(1).max(20),
})
type AgentFormValues = z.infer<typeof agentSchema>

function AgentModal({
  open,
  onClose,
  existing,
}: {
  open: boolean
  onClose: () => void
  existing?: { agent: Agent; user: User | null } | null
}) {
  const [specializations, setSpecializations] = useState<string[]>(existing?.agent.specializations ?? [])
  const [specInput, setSpecInput] = useState('')

  const { mutate: createAgent, isPending: creating } = useCreateAgent()
  const { mutate: updateAgent, isPending: updating } = useUpdateAgent()
  const isPending = creating || updating

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: existing?.user?.name ?? '',
      email: existing?.user?.email ?? '',
      max_concurrent_chats: existing?.agent.max_concurrent_chats ?? 3,
    },
  })

  const addSpec = () => {
    const s = specInput.trim().toLowerCase()
    if (s && !specializations.includes(s)) {
      setSpecializations((prev) => [...prev, s])
      setSpecInput('')
    }
  }

  const onSubmit = (values: AgentFormValues) => {
    if (existing) {
      updateAgent(
        { id: existing.agent.id, name: values.name, max_concurrent_chats: values.max_concurrent_chats, specializations },
        {
          onSuccess: () => { toast.success('Agent updated'); onClose() },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createAgent(
        { ...values, specializations },
        {
          onSuccess: () => { toast.success('Agent added successfully'); reset(); setSpecializations([]); onClose() },
          onError: (err) => toast.error(err.message),
        }
      )
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-neutral-900">
            {existing ? 'Edit Agent' : 'Add Agent'}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
            <Input {...register('name')} placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
            <Input
              {...register('email')}
              type="email"
              placeholder="agent@company.com"
              disabled={!!existing}
              className={existing ? 'opacity-60' : ''}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            {existing && <p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Max Concurrent Chats</label>
            <Input {...register('max_concurrent_chats')} type="number" min={1} max={20} className="w-28" />
            {errors.max_concurrent_chats && <p className="text-red-500 text-xs mt-1">{errors.max_concurrent_chats.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Specializations</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())}
                placeholder="e.g. billing, technical"
                className="flex-1 text-sm"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addSpec} className="rounded-lg">
                <Plus size={15} />
              </Button>
            </div>
            {specializations.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {specializations.map((s) => (
                  <span key={s} className="flex items-center gap-1 bg-violet-50 text-violet-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {s}
                    <button type="button" onClick={() => setSpecializations((prev) => prev.filter((x) => x !== s))} className="ml-0.5 hover:text-red-600">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-full" disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-full" disabled={isPending}>
              {isPending ? (existing ? 'Saving...' : 'Adding...') : (existing ? 'Save Changes' : 'Add Agent')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [autoAssign, setAutoAssign] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<{ agent: Agent; user: User | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ agent: Agent; user: User | null } | null>(null)

  const { data: agentRows = [], isLoading } = useAgents()
  const { mutate: deleteAgent, isPending: deleting } = useDeleteAgent()

  const onlineCount = agentRows.filter((r) => r.agent.status === 'online').length

  const handleEdit = (row: { agent: Agent; user: User | null }) => {
    setEditTarget(row)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditTarget(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditTarget(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteAgent(deleteTarget.agent.id, {
      onSuccess: () => {
        toast.success(`${deleteTarget.user?.name ?? 'Agent'} removed`)
        setDeleteTarget(null)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Human Agents" />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Page controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setAutoAssign(!autoAssign)
                  toast.success(`Auto-assign ${!autoAssign ? 'enabled' : 'disabled'}`)
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-600"
              >
                {autoAssign ? (
                  <ToggleRight size={22} className="text-violet-600" />
                ) : (
                  <ToggleLeft size={22} className="text-neutral-300" />
                )}
                Auto-assign tickets
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {onlineCount} online · {agentRows.length} total
            </div>
          </div>

          <Button size="sm" className="rounded-full gap-2" onClick={handleAddNew}>
            <UserPlus size={15} /> Add Agent
          </Button>
        </div>

        {/* Agent cards grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : agentRows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No agents yet"
            description="Add human agents to handle escalated tickets. They'll appear here when they go online."
            action={{ label: 'Add First Agent', onClick: handleAddNew }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agentRows.map((row) => (
              <AgentCard
                key={row.agent.id}
                agent={row.agent}
                user={row.user}
                onEdit={() => handleEdit(row)}
                onRemove={() => setDeleteTarget(row)}
                onViewQueue={() => toast.info('Queue view coming in next update')}
              />
            ))}
          </div>
        )}
      </main>

      <AgentModal
        open={showModal}
        onClose={handleCloseModal}
        existing={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Agent"
        description={`Remove ${deleteTarget?.user?.name ?? 'this agent'}? They'll be deactivated and can no longer access the system. Their ticket history will be preserved.`}
        confirmLabel={deleting ? 'Removing...' : 'Yes, Remove'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
