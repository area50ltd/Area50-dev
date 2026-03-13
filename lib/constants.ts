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
  { value: 'en-US', label: 'English (US)', group: 'English' },
  { value: 'en-GB', label: 'English (UK)', group: 'English' },
  { value: 'en-AU', label: 'English (Australia)', group: 'English' },
  { value: 'en-IN', label: 'English (India)', group: 'English' },
  { value: 'yo-NG', label: 'Yoruba', group: 'African' },
  { value: 'ha-NG', label: 'Hausa', group: 'African' },
  { value: 'ig-NG', label: 'Igbo', group: 'African' },
  { value: 'sw-KE', label: 'Swahili', group: 'African' },
  { value: 'af-ZA', label: 'Afrikaans', group: 'African' },
  { value: 'fr-FR', label: 'French', group: 'European' },
  { value: 'de-DE', label: 'German', group: 'European' },
  { value: 'es-ES', label: 'Spanish (Spain)', group: 'European' },
  { value: 'es-MX', label: 'Spanish (Mexico)', group: 'European' },
  { value: 'it-IT', label: 'Italian', group: 'European' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)', group: 'European' },
  { value: 'pt-PT', label: 'Portuguese (Portugal)', group: 'European' },
  { value: 'nl-NL', label: 'Dutch', group: 'European' },
  { value: 'pl-PL', label: 'Polish', group: 'European' },
  { value: 'ar-SA', label: 'Arabic', group: 'Middle East & Asia' },
  { value: 'hi-IN', label: 'Hindi', group: 'Middle East & Asia' },
  { value: 'zh-CN', label: 'Chinese (Mandarin)', group: 'Middle East & Asia' },
  { value: 'ja-JP', label: 'Japanese', group: 'Middle East & Asia' },
  { value: 'ko-KR', label: 'Korean', group: 'Middle East & Asia' },
  { value: 'tr-TR', label: 'Turkish', group: 'Middle East & Asia' },
]

// ─── Voice Tones ──────────────────────────────────────────────────────────────

export const VOICE_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly & Warm' },
  { value: 'concise', label: 'Concise & Direct' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'formal', label: 'Formal & Corporate' },
] as const

// ─── Vapi Voice Providers ─────────────────────────────────────────────────────

export const VAPI_VOICE_PROVIDERS = [
  {
    id: 'openai',
    vapiId: 'openai',
    label: 'OpenAI TTS',
    description: 'Natural, conversational — best default',
    customId: false,
    voices: [
      { id: 'alloy', label: 'Alloy', tags: 'neutral · balanced' },
      { id: 'echo', label: 'Echo', tags: 'male · warm' },
      { id: 'fable', label: 'Fable', tags: 'male · expressive' },
      { id: 'onyx', label: 'Onyx', tags: 'male · deep' },
      { id: 'nova', label: 'Nova', tags: 'female · friendly' },
      { id: 'shimmer', label: 'Shimmer', tags: 'female · soft' },
    ],
  },
  {
    id: 'deepgram',
    vapiId: 'deepgram',
    label: 'Deepgram Aura',
    description: 'Ultra-low latency, crisp clarity',
    customId: false,
    voices: [
      { id: 'aura-asteria-en', label: 'Asteria', tags: 'female · confident' },
      { id: 'aura-luna-en', label: 'Luna', tags: 'female · soft' },
      { id: 'aura-stella-en', label: 'Stella', tags: 'female · bright' },
      { id: 'aura-athena-en', label: 'Athena', tags: 'female · warm' },
      { id: 'aura-hera-en', label: 'Hera', tags: 'female · clear' },
      { id: 'aura-orion-en', label: 'Orion', tags: 'male · confident' },
      { id: 'aura-arcas-en', label: 'Arcas', tags: 'male · warm' },
      { id: 'aura-perseus-en', label: 'Perseus', tags: 'male · clear' },
      { id: 'aura-angus-en', label: 'Angus', tags: 'male · deep' },
      { id: 'aura-orpheus-en', label: 'Orpheus', tags: 'male · rich' },
      { id: 'aura-helios-en', label: 'Helios', tags: 'male · smooth' },
      { id: 'aura-zeus-en', label: 'Zeus', tags: 'male · authoritative' },
    ],
  },
  {
    id: 'playht',
    vapiId: 'playht',
    label: 'PlayHT',
    description: 'Emotive, ultra-realistic voices',
    customId: false,
    voices: [
      { id: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json', label: 'Donna', tags: 'female · warm' },
      { id: 's3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json', label: 'Abby', tags: 'female · friendly' },
      { id: 's3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json', label: 'Angelo', tags: 'male · smooth' },
      { id: 's3://voice-cloning-zero-shot/820da3d2-3a3b-42e7-844d-e68db835a206/oliver/manifest.json', label: 'Oliver', tags: 'male · professional' },
    ],
  },
  {
    id: 'cartesia',
    vapiId: 'cartesia',
    label: 'Cartesia Sonic',
    description: 'Fastest latency available',
    customId: false,
    voices: [
      { id: '79a125e8-cd45-4c13-8a67-188112f4dd22', label: 'British Lady', tags: 'female · British' },
      { id: 'a0e99841-438c-4a64-b679-ae501e7d6091', label: 'Barbershop Man', tags: 'male · warm' },
      { id: '729651dc-c6b7-4e88-b627-3db2bc29e2fb', label: 'California Girl', tags: 'female · casual' },
      { id: '5c42302c-194b-4d0c-ba1a-8cb485c84ab9', label: 'Child', tags: 'neutral · young' },
      { id: '2ee87190-8f84-4925-97da-e52547f9462c', label: 'Newsman', tags: 'male · authoritative' },
      { id: 'b7d50908-b17c-442d-ad8d-810c63997ed9', label: 'Sarah', tags: 'female · American' },
    ],
  },
  {
    id: 'elevenlabs',
    vapiId: '11labs',
    label: 'ElevenLabs',
    description: 'Most realistic — bring your own voice clone',
    customId: true,
    voices: [],
  },
]

// ─── Phone Number Countries ───────────────────────────────────────────────────

export const PHONE_COUNTRIES = [
  { group: 'Africa', options: [
    { code: 'NG', label: '🇳🇬 Nigeria' },
    { code: 'ZA', label: '🇿🇦 South Africa' },
    { code: 'KE', label: '🇰🇪 Kenya' },
    { code: 'GH', label: '🇬🇭 Ghana' },
    { code: 'EG', label: '🇪🇬 Egypt' },
    { code: 'MA', label: '🇲🇦 Morocco' },
    { code: 'TZ', label: '🇹🇿 Tanzania' },
    { code: 'SN', label: '🇸🇳 Senegal' },
    { code: 'ET', label: '🇪🇹 Ethiopia' },
    { code: 'RW', label: '🇷🇼 Rwanda' },
  ]},
  { group: 'Americas', options: [
    { code: 'US', label: '🇺🇸 United States' },
    { code: 'CA', label: '🇨🇦 Canada' },
    { code: 'MX', label: '🇲🇽 Mexico' },
    { code: 'BR', label: '🇧🇷 Brazil' },
    { code: 'AR', label: '🇦🇷 Argentina' },
    { code: 'CO', label: '🇨🇴 Colombia' },
    { code: 'CL', label: '🇨🇱 Chile' },
  ]},
  { group: 'Europe', options: [
    { code: 'GB', label: '🇬🇧 United Kingdom' },
    { code: 'DE', label: '🇩🇪 Germany' },
    { code: 'FR', label: '🇫🇷 France' },
    { code: 'ES', label: '🇪🇸 Spain' },
    { code: 'IT', label: '🇮🇹 Italy' },
    { code: 'NL', label: '🇳🇱 Netherlands' },
    { code: 'BE', label: '🇧🇪 Belgium' },
    { code: 'SE', label: '🇸🇪 Sweden' },
    { code: 'NO', label: '🇳🇴 Norway' },
    { code: 'CH', label: '🇨🇭 Switzerland' },
    { code: 'PT', label: '🇵🇹 Portugal' },
    { code: 'IE', label: '🇮🇪 Ireland' },
    { code: 'PL', label: '🇵🇱 Poland' },
  ]},
  { group: 'Middle East', options: [
    { code: 'AE', label: '🇦🇪 UAE' },
    { code: 'SA', label: '🇸🇦 Saudi Arabia' },
    { code: 'IL', label: '🇮🇱 Israel' },
  ]},
  { group: 'Asia Pacific', options: [
    { code: 'AU', label: '🇦🇺 Australia' },
    { code: 'NZ', label: '🇳🇿 New Zealand' },
    { code: 'SG', label: '🇸🇬 Singapore' },
    { code: 'HK', label: '🇭🇰 Hong Kong' },
    { code: 'IN', label: '🇮🇳 India' },
    { code: 'JP', label: '🇯🇵 Japan' },
    { code: 'KR', label: '🇰🇷 South Korea' },
    { code: 'MY', label: '🇲🇾 Malaysia' },
    { code: 'PH', label: '🇵🇭 Philippines' },
    { code: 'TH', label: '🇹🇭 Thailand' },
    { code: 'ID', label: '🇮🇩 Indonesia' },
  ]},
]
