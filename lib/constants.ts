// ─── Credit Costs ─────────────────────────────────────────────────────────────

export const CREDIT_COSTS = {
  ai_message: 1,
  human_message: 3,
  voice_minute: 10,
  outbound_call_flat: 5,
  kb_embed: 5,
} as const

// ─── Plans ────────────────────────────────────────────────────────────────────

export const PLANS = {
  starter: { price_kobo: 1_500_000, credits: 5_000, name: 'Starter' },
  growth: { price_kobo: 3_500_000, credits: 15_000, name: 'Growth' },
  business: { price_kobo: 8_000_000, credits: 40_000, name: 'Business' },
} as const

// ─── Credit Top-up Packs ──────────────────────────────────────────────────────

export const CREDIT_PACKS = [
  { price_kobo: 500_000, credits: 1_500, label: 'Small' },
  { price_kobo: 1_000_000, credits: 3_500, label: 'Medium' },
  { price_kobo: 2_000_000, credits: 8_000, label: 'Large' },
] as const

// ─── Status Colors ────────────────────────────────────────────────────────────

export const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export const sentimentColors: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-600',
  negative: 'bg-orange-100 text-orange-700',
  angry: 'bg-red-100 text-red-700',
}

export const agentStatusColors: Record<string, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
}

// ─── Channel Labels ───────────────────────────────────────────────────────────

export const channelLabels: Record<string, string> = {
  web_widget: 'Web Chat',
  whatsapp: 'WhatsApp',
  voice_inbound: 'Phone Call',
}

// ─── Low Credit Thresholds ────────────────────────────────────────────────────

export const CREDIT_WARNING_THRESHOLD = 500
export const CREDIT_CRITICAL_THRESHOLD = 0

// ─── n8n Route Constants ─────────────────────────────────────────────────────

export const N8N_ROUTES = {
  chat: '/webhook/ai/chat',
  suggest: '/webhook/ai/suggest',
  ticketRoute: '/webhook/ticket/route',
  ticketEscalate: '/webhook/ticket/escalate',
  knowledgeIngest: '/webhook/knowledge/ingest',
  knowledgeSearch: '/webhook/knowledge/search',
  vapiAssistantGet: '/webhook/vapi/assistant/get',
  vapiOutbound: '/webhook/vapi/outbound',
  creditsDeduct: '/webhook/credits/deduct',
} as const

// ─── File Upload ──────────────────────────────────────────────────────────────

export const ALLOWED_KB_EXTENSIONS = ['.pdf', '.txt', '.csv', '.json', '.docx'] as const

export const MAX_UPLOAD_SIZE_MB = 50

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20

// ─── Voice Languages ──────────────────────────────────────────────────────────

export const VOICE_LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr-FR', label: 'French' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ar-SA', label: 'Arabic' },
  { value: 'yo-NG', label: 'Yoruba' },
  { value: 'ha-NG', label: 'Hausa' },
] as const

// ─── Voice Tones ──────────────────────────────────────────────────────────────

export const VOICE_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly & Warm' },
  { value: 'concise', label: 'Concise & Direct' },
  { value: 'empathetic', label: 'Empathetic' },
] as const
