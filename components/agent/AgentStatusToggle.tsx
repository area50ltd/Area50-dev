'use client'

import { useAgentStatus } from '@/hooks/useAgentStatus'

type Status = 'online' | 'away' | 'offline'

const OPTIONS: { value: Status; label: string; dot: string; bg: string; activeBg: string }[] = [
  { value: 'online', label: 'Online', dot: 'bg-green-500', bg: 'text-neutral-500 hover:text-green-600', activeBg: 'bg-green-50 text-green-700 font-semibold' },
  { value: 'away', label: 'Away', dot: 'bg-yellow-400', bg: 'text-neutral-500 hover:text-yellow-600', activeBg: 'bg-yellow-50 text-yellow-700 font-semibold' },
  { value: 'offline', label: 'Offline', dot: 'bg-gray-400', bg: 'text-neutral-500 hover:text-gray-700', activeBg: 'bg-gray-100 text-gray-700 font-semibold' },
]

export function AgentStatusToggle({ initialStatus = 'offline' }: { initialStatus?: Status }) {
  const { status, setStatus } = useAgentStatus(initialStatus)

  return (
    <div className="flex items-center gap-1 bg-white rounded-xl border border-neutral-100 p-1 shadow-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setStatus(opt.value)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm transition-all ${
            status === opt.value ? opt.activeBg : opt.bg
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
          {opt.label}
        </button>
      ))}
    </div>
  )
}
