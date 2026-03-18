'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Package, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Plan {
  id: string
  key: string
  name: string
  price_kobo: number
  credits: number
  is_active: boolean
  sort_order: number
  paystack_plan_code: string | null
  max_agents: number
  max_kb_docs: number
  has_voice: boolean
  has_whatsapp: boolean
  has_custom_personality: boolean
  has_advanced_analytics: boolean
  has_api_access: boolean
  has_multi_account: boolean
  support_tier: string
}

interface CreditPack {
  id: string
  label: string
  price_kobo: number
  credits: number
  is_active: boolean
  sort_order: number
}

function formatUSD(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Plan Modal ───────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs text-neutral-400">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-violet-600' : 'bg-neutral-600'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

function PlanModal({
  plan,
  onClose,
  onSave,
  loading,
}: {
  plan?: Plan
  onClose: () => void
  onSave: (data: Omit<Plan, 'id' | 'is_active'>) => void
  loading: boolean
}) {
  const [key, setKey] = useState(plan?.key ?? '')
  const [name, setName] = useState(plan?.name ?? '')
  const [priceKobo, setPriceKobo] = useState(plan ? plan.price_kobo / 100 : 0)
  const [credits, setCredits] = useState(plan?.credits ?? 0)
  const [sortOrder, setSortOrder] = useState(plan?.sort_order ?? 0)
  const [paystackCode, setPaystackCode] = useState(plan?.paystack_plan_code ?? '')
  const [maxAgents, setMaxAgents] = useState(plan?.max_agents ?? 1)
  const [maxKbDocs, setMaxKbDocs] = useState(plan?.max_kb_docs ?? 10)
  const [hasVoice, setHasVoice] = useState(plan?.has_voice ?? false)
  const [hasWhatsapp, setHasWhatsapp] = useState(plan?.has_whatsapp ?? false)
  const [hasPersonality, setHasPersonality] = useState(plan?.has_custom_personality ?? false)
  const [hasAnalytics, setHasAnalytics] = useState(plan?.has_advanced_analytics ?? false)
  const [hasApi, setHasApi] = useState(plan?.has_api_access ?? false)
  const [hasMulti, setHasMulti] = useState(plan?.has_multi_account ?? false)
  const [supportTier, setSupportTier] = useState(plan?.support_tier ?? 'email')
  const isEdit = !!plan

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg border border-neutral-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-white mb-5">
          {isEdit ? 'Edit Plan' : 'Add Plan'}
        </h3>
        <div className="space-y-4">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Key (unique slug)</label>
              <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="starter" disabled={isEdit}
                className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Display Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Starter"
                className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Price ($)</label>
              <Input type="number" value={priceKobo} onChange={(e) => setPriceKobo(Number(e.target.value))} min={0}
                className="bg-neutral-700 border-neutral-600 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Credits/mo</label>
              <Input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} min={0}
                className="bg-neutral-700 border-neutral-600 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Sort Order</label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0}
                className="bg-neutral-700 border-neutral-600 text-white text-sm" />
            </div>
          </div>

          {/* Paystack */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Paystack Plan Code <span className="text-neutral-600">(PLN_xxxx — from Paystack dashboard)</span></label>
            <Input value={paystackCode} onChange={(e) => setPaystackCode(e.target.value)} placeholder="PLN_xxxxxxxxxxxxxxxx"
              className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-500 font-mono text-xs" />
          </div>

          {/* Limits */}
          <div className="border-t border-neutral-700 pt-4">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Feature Limits</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Max Agents <span className="text-neutral-600">(-1 = unlimited)</span></label>
                <Input type="number" value={maxAgents} onChange={(e) => setMaxAgents(Number(e.target.value))} min={-1}
                  className="bg-neutral-700 border-neutral-600 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Max KB Docs <span className="text-neutral-600">(-1 = unlimited)</span></label>
                <Input type="number" value={maxKbDocs} onChange={(e) => setMaxKbDocs(Number(e.target.value))} min={-1}
                  className="bg-neutral-700 border-neutral-600 text-white text-sm" />
              </div>
            </div>
            <div className="space-y-2.5">
              <Toggle checked={hasVoice} onChange={setHasVoice} label="Voice Calls" />
              <Toggle checked={hasWhatsapp} onChange={setHasWhatsapp} label="WhatsApp" />
              <Toggle checked={hasPersonality} onChange={setHasPersonality} label="Custom AI Personality" />
              <Toggle checked={hasAnalytics} onChange={setHasAnalytics} label="Advanced Analytics" />
              <Toggle checked={hasApi} onChange={setHasApi} label="API Access" />
              <Toggle checked={hasMulti} onChange={setHasMulti} label="Multi-Account Management" />
            </div>
            <div className="mt-3">
              <label className="block text-xs text-neutral-400 mb-1">Support Tier</label>
              <select value={supportTier} onChange={(e) => setSupportTier(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 text-white text-sm rounded-lg px-3 py-2">
                <option value="email">Email</option>
                <option value="priority_email">Priority Email</option>
                <option value="dedicated">Dedicated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1 rounded-full bg-neutral-700 text-white hover:bg-neutral-600" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full gap-2"
            onClick={() => onSave({
              key, name, price_kobo: priceKobo * 100, credits, sort_order: sortOrder,
              paystack_plan_code: paystackCode || null,
              max_agents: maxAgents, max_kb_docs: maxKbDocs,
              has_voice: hasVoice, has_whatsapp: hasWhatsapp,
              has_custom_personality: hasPersonality, has_advanced_analytics: hasAnalytics,
              has_api_access: hasApi, has_multi_account: hasMulti,
              support_tier: supportTier,
            })}
            disabled={loading || !key || !name}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Plan'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Credit Pack Modal ────────────────────────────────────────────────────────
function PackModal({
  pack,
  onClose,
  onSave,
  loading,
}: {
  pack?: CreditPack
  onClose: () => void
  onSave: (data: Omit<CreditPack, 'id' | 'is_active'>) => void
  loading: boolean
}) {
  const [label, setLabel] = useState(pack?.label ?? '')
  const [priceKobo, setPriceKobo] = useState(pack ? pack.price_kobo / 100 : 0)
  const [credits, setCredits] = useState(pack?.credits ?? 0)
  const [sortOrder, setSortOrder] = useState(pack?.sort_order ?? 0)
  const isEdit = !!pack

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-neutral-800 rounded-2xl p-6 w-full max-w-md border border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-white mb-5">
          {isEdit ? 'Edit Credit Pack' : 'Add Credit Pack'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Small"
              className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Price ($)</label>
              <Input
                type="number"
                value={priceKobo}
                onChange={(e) => setPriceKobo(Number(e.target.value))}
                min={0}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Credits</label>
              <Input
                type="number"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                min={0}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Sort Order</label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={0}
              className="bg-neutral-700 border-neutral-600 text-white"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1 rounded-full bg-neutral-700 text-white hover:bg-neutral-600" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full gap-2"
            onClick={() => onSave({ label, price_kobo: priceKobo * 100, credits, sort_order: sortOrder })}
            disabled={loading || !label}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Pack'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlansPage() {
  const qc = useQueryClient()
  const [planModal, setPlanModal] = useState<'add' | Plan | null>(null)
  const [packModal, setPackModal] = useState<'add' | CreditPack | null>(null)

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['sa-plans'],
    queryFn: () => fetch('/api/super-admin/plans').then((r) => r.json()),
  })

  const { data: packs = [], isLoading: packsLoading } = useQuery<CreditPack[]>({
    queryKey: ['sa-credit-packs'],
    queryFn: () => fetch('/api/super-admin/credit-packs').then((r) => r.json()),
  })

  // ─── Plan mutations ───────────────────────────────────────────────────────
  const createPlan = useMutation({
    mutationFn: (data: object) =>
      fetch('/api/super-admin/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(async (r) => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Error') }
        return r.json()
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-plans'] }); setPlanModal(null); toast.success('Plan created') },
    onError: (e: Error) => toast.error(e.message),
  })

  const updatePlan = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Omit<Plan, 'id'>>) =>
      fetch(`/api/super-admin/plans/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-plans'] }); setPlanModal(null); toast.success('Plan updated') },
    onError: () => toast.error('Failed to update plan'),
  })

  const deletePlan = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/super-admin/plans/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Error') }
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-plans'] }); toast.success('Plan deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  const togglePlan = (plan: Plan) =>
    updatePlan.mutate({ id: plan.id, is_active: !plan.is_active })

  // ─── Pack mutations ───────────────────────────────────────────────────────
  const createPack = useMutation({
    mutationFn: (data: object) =>
      fetch('/api/super-admin/credit-packs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-credit-packs'] }); setPackModal(null); toast.success('Credit pack created') },
    onError: () => toast.error('Failed to create pack'),
  })

  const updatePack = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Omit<CreditPack, 'id'>>) =>
      fetch(`/api/super-admin/credit-packs/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-credit-packs'] }); setPackModal(null); toast.success('Pack updated') },
    onError: () => toast.error('Failed to update pack'),
  })

  const deletePack = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/super-admin/credit-packs/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-credit-packs'] }); toast.success('Pack deleted') },
    onError: () => toast.error('Failed to delete pack'),
  })

  const togglePack = (pack: CreditPack) =>
    updatePack.mutate({ id: pack.id, is_active: !pack.is_active })

  return (
    <div className="p-4 sm:p-8 space-y-10">
      {/* ─── Subscription Plans ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-violet-600" />
            <h2 className="font-heading text-xl font-bold text-white">Subscription Plans</h2>
          </div>
          <Button size="sm" className="rounded-full gap-2" onClick={() => setPlanModal('add')}>
            <Plus size={14} /> Add Plan
          </Button>
        </div>

        <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Key</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Price</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Credits</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Paystack</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {plansLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-neutral-500">Loading...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-neutral-500">No plans yet</td></tr>
              ) : (
                plans.map((plan) => (
                  <motion.tr
                    key={plan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{plan.name}</td>
                    <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{plan.key}</td>
                    <td className="px-4 py-3 text-white">{formatUSD(plan.price_kobo)}</td>
                    <td className="px-4 py-3 text-white">{plan.credits.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {plan.paystack_plan_code ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="font-mono truncate max-w-[80px]">{plan.paystack_plan_code}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                          Not linked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.is_active ? 'bg-green-900/40 text-green-400' : 'bg-neutral-700 text-neutral-400'}`}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => togglePlan(plan)}
                          className="p-1.5 rounded-lg hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors"
                          title={plan.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {plan.is_active ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => setPlanModal(plan)}
                          className="p-1.5 rounded-lg hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deletePlan.mutate(plan.id)}
                          className="p-1.5 rounded-lg hover:bg-red-900/40 text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      {/* ─── Credit Packs ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-violet-600" />
            <h2 className="font-heading text-xl font-bold text-white">Credit Packs</h2>
          </div>
          <Button size="sm" className="rounded-full gap-2" onClick={() => setPackModal('add')}>
            <Plus size={14} /> Add Pack
          </Button>
        </div>

        <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Label</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Price</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Credits</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Sort</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {packsLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">Loading...</td></tr>
              ) : packs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">No credit packs yet</td></tr>
              ) : (
                packs.map((pack) => (
                  <motion.tr
                    key={pack.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{pack.label}</td>
                    <td className="px-4 py-3 text-white">{formatUSD(pack.price_kobo)}</td>
                    <td className="px-4 py-3 text-white">{pack.credits.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pack.is_active ? 'bg-green-900/40 text-green-400' : 'bg-neutral-700 text-neutral-400'}`}>
                        {pack.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">{pack.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => togglePack(pack)}
                          className="p-1.5 rounded-lg hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors"
                        >
                          {pack.is_active ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => setPackModal(pack)}
                          className="p-1.5 rounded-lg hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deletePack.mutate(pack.id)}
                          className="p-1.5 rounded-lg hover:bg-red-900/40 text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {planModal !== null && (
          <PlanModal
            plan={planModal === 'add' ? undefined : planModal}
            onClose={() => setPlanModal(null)}
            onSave={(data) => {
              if (planModal === 'add') {
                createPlan.mutate(data)
              } else {
                updatePlan.mutate({ id: (planModal as Plan).id, ...data })
              }
            }}
            loading={createPlan.isPending || updatePlan.isPending}
          />
        )}
        {packModal !== null && (
          <PackModal
            pack={packModal === 'add' ? undefined : packModal}
            onClose={() => setPackModal(null)}
            onSave={(data) => {
              if (packModal === 'add') {
                createPack.mutate(data)
              } else {
                updatePack.mutate({ id: (packModal as CreditPack).id, ...data })
              }
            }}
            loading={createPack.isPending || updatePack.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
