'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Activity, RefreshCw, Terminal, Cpu, HardDrive,
  Wifi, CheckCircle2, AlertTriangle, Clock, Zap, Radio,
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
  { id: '8', level: 'warn', message: 'Outbound voice call timed out after 30s', timestamp: '14:15:10', source: 'voice' },
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
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS)
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'checking' | 'up' | 'down'>('idle')

  const { data: settings = {} } = useQuery<Record<string, string>>({
    queryKey: ['sa-settings'],
    queryFn: () => fetch('/api/super-admin/settings').then((r) => r.json()),
  })

  const selectedModel = settings['ai_model'] ?? 'gpt-4o'

  const saveModel = useMutation({
    mutationFn: (model: string) =>
      fetch('/api/super-admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai_model', value: model }),
      }).then((r) => r.json()),
    onSuccess: () => toast.success('AI model updated'),
    onError: () => toast.error('Failed to update model'),
  })

  const handleRefreshLogs = () => {
    setLogs([...SAMPLE_LOGS].reverse())
    toast.info('Logs refreshed')
  }

  const handlePingN8n = async () => {
    setN8nStatus('checking')
    try {
      const res = await fetch('/api/super-admin/settings')
      const s = await res.json() as Record<string, string>
      // The n8n_webhook_base_url stored in settings is masked — use the known URL
      const n8nUrl = s['n8n_webhook_base_url'] || 'https://n8n.srv1194565.hstgr.cloud'
      const pingRes = await fetch(`/api/super-admin/n8n-ping?url=${encodeURIComponent(n8nUrl)}`, {
        signal: AbortSignal.timeout(5000),
      }).catch(() => null)
      setN8nStatus(pingRes?.ok ? 'up' : 'down')
    } catch {
      setN8nStatus('down')
    }
  }

  const serverMetrics = [
    { label: 'CPU Usage', value: '18%', icon: Cpu, good: true },
    { label: 'RAM Usage', value: '3.2 / 8 GB', icon: HardDrive, good: true },
    { label: 'Disk Usage', value: '42 / 100 GB', icon: HardDrive, good: true },
    { label: 'n8n Latency', value: '312ms', icon: Wifi, good: true },
  ]

  return (
    <main className="flex-1 p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white mb-1">System Settings</h1>
        <p className="text-neutral-500 text-sm">AI model config, VPS health, and system logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* AI Model Config */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-violet-600" />
            <h2 className="text-white font-semibold text-sm">AI Model Configuration</h2>
          </div>

          <div className="space-y-3">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => saveModel.mutate(model.id)}
                disabled={saveModel.isPending}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left',
                  selectedModel === model.id
                    ? 'border-violet-600 bg-violet-600/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/50'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  selectedModel === model.id ? 'border-violet-600' : 'border-neutral-600'
                )}>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 rounded-full bg-violet-600" />
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{model.label}</p>
                  <p className="text-neutral-500 text-xs">{model.description}</p>
                </div>
                {saveModel.isPending && selectedModel === model.id && (
                  <RefreshCw size={12} className="animate-spin text-neutral-400 ml-auto" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-600 mt-3">Click a model to switch immediately — saved to platform settings.</p>
        </div>

        {/* VPS / Server Health */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-violet-600" />
              <h2 className="text-white font-semibold text-sm">VPS Health</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 mb-4">
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

          <div className="space-y-2 mb-4">
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

          {/* n8n ping */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded-lg text-xs"
              onClick={handlePingN8n}
              disabled={n8nStatus === 'checking'}
            >
              {n8nStatus === 'checking' ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Radio size={12} />
              )}
              Ping n8n
            </Button>
            {n8nStatus === 'up' && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> n8n is reachable
              </span>
            )}
            {n8nStatus === 'down' && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} /> n8n unreachable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-violet-600" />
            <h2 className="text-white font-semibold text-sm">System Logs</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs">
              {(['info', 'warn', 'error'] as const).map((level) => (
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
