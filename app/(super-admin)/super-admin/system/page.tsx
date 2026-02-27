'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Activity, RefreshCw, Terminal, Cpu, HardDrive,
  Wifi, CheckCircle2, AlertTriangle, Clock, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LogEntry {
  id: string
  level: 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  source: string
}

const SAMPLE_LOGS: LogEntry[] = [
  { id: '1', level: 'info', message: 'n8n webhook /webhook/ai/chat — 200 OK (421ms)', timestamp: '14:32:01', source: 'n8n' },
  { id: '2', level: 'info', message: 'Ticket #TKT-8821 escalated to human agent', timestamp: '14:31:55', source: 'routing' },
  { id: '3', level: 'warn', message: 'Company 3f2a... credit balance below 500 threshold', timestamp: '14:30:12', source: 'credits' },
  { id: '4', level: 'info', message: 'Knowledge document embedded successfully — 42 chunks', timestamp: '14:28:44', source: 'kb' },
  { id: '5', level: 'error', message: 'Paystack webhook signature mismatch — dropped', timestamp: '14:27:30', source: 'payments' },
  { id: '6', level: 'info', message: 'New company onboarded: Kuda MicroFinance', timestamp: '14:20:05', source: 'clerk' },
  { id: '7', level: 'info', message: 'WhatsApp message processed — ticket created TKT-8820', timestamp: '14:18:22', source: 'whatsapp' },
  { id: '8', level: 'warn', message: 'Vapi outbound call timed out after 30s', timestamp: '14:15:10', source: 'vapi' },
]

const AI_MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', description: 'Best quality, higher cost' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Balanced quality and cost' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and cost-efficient' },
]

const LOG_COLORS: Record<string, string> = {
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
}

const LOG_BG: Record<string, string> = {
  info: 'bg-blue-500/10',
  warn: 'bg-yellow-500/10',
  error: 'bg-red-500/10',
}

export default function SuperAdminSystemPage() {
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS)
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    await new Promise((r) => setTimeout(r, 1500))
    setUpdating(false)
    toast.success('System settings updated')
  }

  const handleRefreshLogs = () => {
    setLogs([...SAMPLE_LOGS].reverse())
    toast.info('Logs refreshed')
  }

  const serverMetrics = [
    { label: 'CPU Usage', value: '18%', icon: Cpu, good: true },
    { label: 'RAM Usage', value: '3.2 / 8 GB', icon: HardDrive, good: true },
    { label: 'Disk Usage', value: '42 / 100 GB', icon: HardDrive, good: true },
    { label: 'n8n Latency', value: '312ms', icon: Wifi, good: true },
  ]

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white mb-1">System Settings</h1>
        <p className="text-neutral-500 text-sm">AI model config, VPS health, and system logs.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* AI Model Config */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-[#E91E8C]" />
            <h2 className="text-white font-semibold text-sm">AI Model Configuration</h2>
          </div>

          <div className="space-y-3 mb-5">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left',
                  selectedModel === model.id
                    ? 'border-[#E91E8C] bg-[#E91E8C]/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/50'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  selectedModel === model.id ? 'border-[#E91E8C]' : 'border-neutral-600'
                )}>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 rounded-full bg-[#E91E8C]" />
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{model.label}</p>
                  <p className="text-neutral-500 text-xs">{model.description}</p>
                </div>
              </button>
            ))}
          </div>

          <Button onClick={handleUpdate} disabled={updating} className="w-full rounded-xl">
            {updating ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                Updating...
              </span>
            ) : 'Update Model Config'}
          </Button>
        </div>

        {/* VPS / Server Health */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#E91E8C]" />
              <h2 className="text-white font-semibold text-sm">VPS Health</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {serverMetrics.map(({ label, value, icon: Icon, good }) => (
              <div key={label} className="bg-neutral-800 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={13} className="text-neutral-400" />
                  <span className="text-xs text-neutral-500">{label}</span>
                </div>
                <p className={cn('font-mono font-semibold text-sm', good ? 'text-green-400' : 'text-red-400')}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">n8n URL</span>
              <span className="text-neutral-300 font-mono truncate ml-2">n8n.srv1194565.hstgr.cloud</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">VPS Region</span>
              <span className="text-neutral-300">Paris, France</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Uptime</span>
              <span className="text-green-400 font-mono">14d 6h 22m</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#E91E8C]" />
            <h2 className="text-white font-semibold text-sm">System Logs</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs">
              {['info', 'warn', 'error'].map((level) => (
                <span key={level} className={cn('flex items-center gap-1.5', LOG_COLORS[level])}>
                  <div className={cn('w-2 h-2 rounded-full', level === 'info' ? 'bg-blue-400' : level === 'warn' ? 'bg-yellow-400' : 'bg-red-400')} />
                  {level}
                </span>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 gap-1.5"
              onClick={handleRefreshLogs}
            >
              <RefreshCw size={12} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-1.5 max-h-72 overflow-y-auto font-mono text-xs">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn('flex items-start gap-3 px-3 py-2 rounded-lg', LOG_BG[log.level])}
            >
              <span className="text-neutral-600 shrink-0 mt-0.5">{log.timestamp}</span>
              <span className={cn('font-semibold uppercase shrink-0 w-10', LOG_COLORS[log.level])}>
                {log.level}
              </span>
              <span className="text-neutral-500 shrink-0">[{log.source}]</span>
              <span className={cn('flex-1', LOG_COLORS[log.level] === 'text-red-400' ? 'text-red-300' : 'text-neutral-300')}>
                {log.message}
              </span>
              {log.level === 'error' ? (
                <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
              ) : log.level === 'warn' ? (
                <Clock size={12} className="text-yellow-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 size={12} className="text-blue-400 shrink-0 mt-0.5" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
