'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CreditCard,
  Bot,
  Palette,
  FileUp,
  CheckCircle2,
  Upload,
  X,
} from 'lucide-react'
import { PLANS } from '@/lib/constants'

// ─── Step schemas ─────────────────────────────────────────────────────────────

const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  supportEmail: z.string().email('Enter a valid email address'),
})

const step3Schema = z.object({
  aiPersonality: z.string().min(20, 'Please describe the AI personality in at least 20 characters'),
})

const step4Schema = z.object({
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  welcomeMessage: z.string().min(5, 'Welcome message too short'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step3Data = z.infer<typeof step3Schema>
type Step4Data = z.infer<typeof step4Schema>

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Company', icon: Building2 },
  { label: 'Plan', icon: CreditCard },
  { label: 'AI Setup', icon: Bot },
  { label: 'Widget', icon: Palette },
  { label: 'Knowledge', icon: FileUp },
  { label: 'Done', icon: CheckCircle2 },
]

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        {/* Track */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-neutral-200">
          <motion.div
            className="h-full bg-[#E91E8C]"
            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const stepNum = idx + 1
          const done = stepNum < currentStep
          const active = stepNum === currentStep
          return (
            <div key={step.label} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  done
                    ? 'bg-[#E91E8C] border-[#E91E8C] text-white'
                    : active
                    ? 'bg-white border-[#E91E8C] text-[#E91E8C]'
                    : 'bg-white border-neutral-200 text-neutral-400'
                }`}
              >
                {done ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <step.icon size={14} />
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? 'text-[#E91E8C]' : done ? 'text-[#1B2A4A]' : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step shells ──────────────────────────────────────────────────────────────

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

// ─── Step 1: Company Info ─────────────────────────────────────────────────────

function Step1({ onNext, defaultValues }: { onNext: (data: Step1Data) => void; defaultValues?: Partial<Step1Data> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  })

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-[#1B2A4A] mb-2">Tell us about your company</h2>
      <p className="text-neutral-500 mb-8">This sets up your Area50 workspace.</p>

      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
          <input
            {...register('companyName')}
            placeholder="e.g. Acme Corp"
            className="w-full h-11 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 text-sm"
          />
          {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Support Email</label>
          <input
            {...register('supportEmail')}
            type="email"
            placeholder="support@yourcompany.com"
            className="w-full h-11 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 text-sm"
          />
          {errors.supportEmail && <p className="text-red-500 text-xs mt-1">{errors.supportEmail.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full mt-2">
          Continue <ArrowRight size={16} />
        </Button>
      </form>
    </StepContainer>
  )
}

// ─── Step 2: Plan Selection ───────────────────────────────────────────────────

function Step2({ onNext, onBack, selected, setSelected }: {
  onNext: () => void
  onBack: () => void
  selected: string
  setSelected: (plan: string) => void
}) {
  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-[#1B2A4A] mb-2">Choose your plan</h2>
      <p className="text-neutral-500 mb-8">You can upgrade or downgrade any time.</p>

      <div className="grid gap-4 mb-8">
        {Object.entries(PLANS).map(([key, plan]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`flex items-center justify-between p-5 rounded-xl border-2 text-left transition-all ${
              selected === key
                ? 'border-[#E91E8C] bg-[#FDE7F3]'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <div>
              <p className={`font-heading font-bold text-lg ${selected === key ? 'text-[#E91E8C]' : 'text-[#1B2A4A]'}`}>
                {plan.name}
              </p>
              <p className="text-neutral-500 text-sm">{plan.credits.toLocaleString()} credits/month</p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-xl text-[#1B2A4A]">
                ₦{(plan.price_kobo / 100).toLocaleString()}
              </p>
              <p className="text-neutral-400 text-xs">/month</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="rounded-full">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button size="lg" onClick={onNext} className="flex-1 rounded-full">
          Continue <ArrowRight size={16} />
        </Button>
      </div>
    </StepContainer>
  )
}

// ─── Step 3: AI Personality ───────────────────────────────────────────────────

function Step3({ onNext, onBack, defaultValues }: {
  onNext: (data: Step3Data) => void
  onBack: () => void
  defaultValues?: Partial<Step3Data>
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      aiPersonality: defaultValues?.aiPersonality ?? '',
    },
  })
  const text = watch('aiPersonality') ?? ''

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-[#1B2A4A] mb-2">Define your AI&apos;s personality</h2>
      <p className="text-neutral-500 mb-8">This shapes how your AI speaks to customers.</p>

      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            AI Personality Description
          </label>
          <textarea
            {...register('aiPersonality')}
            rows={6}
            placeholder={`e.g. "You are a friendly and professional support agent for Acme Corp. Always greet customers warmly, answer questions concisely, and escalate billing issues to a human agent. Maintain a helpful tone even when customers are frustrated."`}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 text-sm resize-none leading-relaxed"
          />
          <div className="flex justify-between mt-1">
            {errors.aiPersonality && <p className="text-red-500 text-xs">{errors.aiPersonality.message}</p>}
            <p className="text-neutral-400 text-xs ml-auto">{text.length} chars</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" type="button" onClick={onBack} className="rounded-full">
            <ArrowLeft size={16} /> Back
          </Button>
          <Button type="submit" size="lg" className="flex-1 rounded-full">
            Continue <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </StepContainer>
  )
}

// ─── Step 4: Widget Customization ────────────────────────────────────────────

const PRESET_COLORS = ['#1B2A4A', '#E91E8C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

function Step4({ onNext, onBack, defaultValues }: {
  onNext: (data: Step4Data) => void
  onBack: () => void
  defaultValues?: Partial<Step4Data>
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      widgetColor: defaultValues?.widgetColor ?? '#1B2A4A',
      welcomeMessage: defaultValues?.welcomeMessage ?? 'Hello! How can I help you today?',
    },
  })
  const color = watch('widgetColor')
  const message = watch('welcomeMessage')

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-[#1B2A4A] mb-2">Customize your widget</h2>
      <p className="text-neutral-500 mb-8">Match your brand. Preview updates in real time.</p>

      <form onSubmit={handleSubmit(onNext)}>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Widget Color</label>
              <div className="flex gap-2 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('widgetColor', c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-neutral-800 scale-110' : 'border-neutral-200'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                {...register('widgetColor')}
                type="text"
                placeholder="#1B2A4A"
                className="w-full h-10 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm font-mono"
              />
              {errors.widgetColor && <p className="text-red-500 text-xs mt-1">{errors.widgetColor.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Welcome Message</label>
              <textarea
                {...register('welcomeMessage')}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#E91E8C] text-sm resize-none"
              />
              {errors.welcomeMessage && <p className="text-red-500 text-xs mt-1">{errors.welcomeMessage.message}</p>}
            </div>
          </div>

          {/* Live preview */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Live Preview</label>
            <div className="bg-neutral-100 rounded-xl p-4 h-56 flex items-end justify-end">
              <div className="w-56 bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
                <div className="px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: color }}>
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                  <p className="text-white text-xs font-semibold truncate">Support</p>
                </div>
                <div className="p-3 bg-neutral-50 h-16 flex items-end">
                  <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-neutral-700 shadow-sm max-w-full">
                    {message || 'Hello! How can I help?'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" type="button" onClick={onBack} className="rounded-full">
            <ArrowLeft size={16} /> Back
          </Button>
          <Button type="submit" size="lg" className="flex-1 rounded-full">
            Continue <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </StepContainer>
  )
}

// ─── Step 5: Knowledge Base Upload ───────────────────────────────────────────

function Step5({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  async function handleSubmit() {
    if (!file) { onNext(); return }
    setUploading(true)
    // Uploading will be handled by the real API once credentials are set
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Document queued for embedding!')
    setUploading(false)
    onNext()
  }

  return (
    <StepContainer>
      <h2 className="font-heading text-2xl font-bold text-[#1B2A4A] mb-2">Upload your first document</h2>
      <p className="text-neutral-500 mb-8">Your AI learns from it instantly. You can add more later.</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-neutral-200 rounded-2xl p-10 text-center hover:border-[#E91E8C]/40 hover:bg-[#FDE7F3]/30 transition-colors mb-6 cursor-pointer"
        onClick={() => document.getElementById('kb-file')?.click()}
      >
        <Upload size={32} className="mx-auto mb-3 text-neutral-300" />
        <p className="font-medium text-neutral-700 mb-1">Drop a file here or click to browse</p>
        <p className="text-neutral-400 text-sm">PDF, TXT, CSV, DOCX, JSON · Max 50MB</p>
        <input
          id="kb-file"
          type="file"
          accept=".pdf,.txt,.csv,.docx,.json"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {file && (
        <div className="flex items-center justify-between bg-[#FDE7F3] border border-[#E91E8C]/20 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-3">
            <FileUp size={18} className="text-[#E91E8C]" />
            <div>
              <p className="text-sm font-medium text-[#1B2A4A]">{file.name}</p>
              <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button onClick={() => setFile(null)} className="text-neutral-400 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="rounded-full">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button variant="ghost" size="lg" onClick={onNext} className="rounded-full text-neutral-500">
          Skip for now
        </Button>
        <Button size="lg" onClick={handleSubmit} disabled={uploading} className="flex-1 rounded-full">
          {uploading ? 'Uploading...' : 'Continue'}
          {!uploading && <ArrowRight size={16} />}
        </Button>
      </div>
    </StepContainer>
  )
}

// ─── Step 6: Done ─────────────────────────────────────────────────────────────

function Step6({ companyName, onComplete }: { companyName: string; onComplete: () => Promise<void> }) {
  const [loading, setLoading] = useState(false)

  async function handleGo() {
    setLoading(true)
    await onComplete().catch(() => setLoading(false))
  }

  return (
    <StepContainer>
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#E91E8C]/30"
        >
          <CheckCircle2 size={36} className="text-white" />
        </motion.div>

        <h2 className="font-heading text-3xl font-bold text-[#1B2A4A] mb-3">
          You&apos;re all set, {companyName}!
        </h2>
        <p className="text-neutral-500 text-lg mb-10 max-w-sm mx-auto">
          Your AI support system is ready. Let&apos;s explore your dashboard.
        </p>

        <Button
          size="xl"
          onClick={handleGo}
          disabled={loading}
          className="rounded-full shadow-xl shadow-[#E91E8C]/25"
        >
          {loading ? 'Setting up...' : 'Go to Dashboard'} {!loading && <ArrowRight size={18} />}
        </Button>
      </div>
    </StepContainer>
  )
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState({
    companyName: '',
    supportEmail: '',
    plan: 'growth',
    aiPersonality: '',
    widgetColor: '#1B2A4A',
    welcomeMessage: 'Hello! How can I help you today?',
  })

  const next = () => setCurrentStep((s) => Math.min(s + 1, 6))
  const back = () => setCurrentStep((s) => Math.max(s - 1, 1))

  async function handleComplete() {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: data.companyName,
        supportEmail: data.supportEmail,
        plan: data.plan,
        aiPersonality: data.aiPersonality,
        widgetColor: data.widgetColor,
        welcomeMessage: data.welcomeMessage,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error ?? 'Setup failed. Please try again.')
      throw new Error('Onboarding failed')
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center">
            <span className="text-white font-heading font-bold text-sm">A</span>
          </div>
          <span className="font-heading font-bold text-xl text-[#1B2A4A]">Area50</span>
        </div>

        <ProgressBar currentStep={currentStep} />

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 md:p-10">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1
                key="step1"
                onNext={(d) => { setData((prev) => ({ ...prev, ...d })); next() }}
                defaultValues={{ companyName: data.companyName, supportEmail: data.supportEmail }}
              />
            )}
            {currentStep === 2 && (
              <Step2
                key="step2"
                onNext={next}
                onBack={back}
                selected={data.plan}
                setSelected={(plan) => setData((prev) => ({ ...prev, plan }))}
              />
            )}
            {currentStep === 3 && (
              <Step3
                key="step3"
                onNext={(d) => { setData((prev) => ({ ...prev, ...d })); next() }}
                onBack={back}
                defaultValues={{ aiPersonality: data.aiPersonality }}
              />
            )}
            {currentStep === 4 && (
              <Step4
                key="step4"
                onNext={(d) => { setData((prev) => ({ ...prev, ...d })); next() }}
                onBack={back}
                defaultValues={{ widgetColor: data.widgetColor, welcomeMessage: data.welcomeMessage }}
              />
            )}
            {currentStep === 5 && (
              <Step5 key="step5" onNext={next} onBack={back} />
            )}
            {currentStep === 6 && (
              <Step6 key="step6" companyName={data.companyName || 'there'} onComplete={handleComplete} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
