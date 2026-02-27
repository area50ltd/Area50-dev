'use client'

import { Sparkles, RefreshCw } from 'lucide-react'

interface SuggestionPanelProps {
  suggestions: string[]
  isLoading?: boolean
  onSelect: (suggestion: string) => void
  onRefresh?: () => void
}

export function SuggestionPanel({ suggestions, isLoading, onSelect, onRefresh }: SuggestionPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-heading text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#E91E8C]" /> AI Suggestions
        </h4>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-neutral-400 text-center py-3">
          No suggestions yet
        </p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left text-xs text-neutral-600 bg-neutral-50 hover:bg-[#FDE7F3] hover:text-[#E91E8C] border border-neutral-100 hover:border-[#E91E8C]/20 rounded-lg px-3 py-2.5 transition-all leading-relaxed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
