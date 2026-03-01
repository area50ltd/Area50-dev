// ─── Core Entity Types ────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'customer' | 'maintenance'

export type TicketStatus = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed'

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export type TicketChannel = 'web_widget' | 'whatsapp' | 'voice_inbound'

export type AgentStatus = 'online' | 'away' | 'offline'

export type SenderType = 'customer' | 'ai' | 'agent'

export type EmbeddingStatus = 'pending' | 'processing' | 'completed' | 'error'

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'angry'

export type Plan = 'starter' | 'growth' | 'business'

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  email: string
  plan: string | null
  credits: number | null
  language: string | null
  ai_personality: string | null
  widget_color: string | null
  widget_avatar: string | null
  widget_welcome: string | null
  vapi_assistant_id: string | null
  vapi_phone_number: string | null
  vapi_phone_number_id: string | null
  whatsapp_phone_id: string | null
  whatsapp_token: string | null
  slack_webhook_url: string | null
  voice_language: string | null
  voice_accent: string | null
  voice_gender: string | null
  voice_tone: string | null
  elevenlabs_voice_id: string | null
  is_active: boolean | null
  created_at: Date | null
  updated_at: Date | null
}

export interface User {
  id: string
  clerk_id: string
  company_id: string | null
  name: string | null
  email: string
  phone: string | null
  role: string
  is_active: boolean | null
  created_at: Date | null
}

export interface Ticket {
  id: string
  company_id: string | null
  customer_id: string | null
  agent_id: string | null
  channel: string | null
  status: string | null
  assigned_to: string | null
  priority: string | null
  category: string | null
  complexity_score: number | null
  ai_summary: string | null
  sentiment: string | null
  language: string | null
  session_id: string | null
  is_resolved: boolean | null
  resolved_at: Date | null
  created_at: Date | null
  updated_at: Date | null
}

export interface Message {
  id: string
  ticket_id: string | null
  company_id: string | null
  sender_type: string
  sender_id: string | null
  content: string
  is_helpful: boolean | null
  created_at: Date | null
}

export interface Agent {
  id: string
  user_id: string | null
  company_id: string | null
  status: string | null
  max_concurrent_chats: number | null
  active_chats: number | null
  total_resolved: number | null
  avg_response_time: number | null
  specializations: string[] | null
  created_at: Date | null
}

export interface RoutingRule {
  id: string
  company_id: string | null
  complexity_threshold: number | null
  business_hours_start: string | null
  business_hours_end: string | null
  timezone: string | null
  after_hours_mode: string | null
  max_ai_attempts: number | null
  keywords_escalate: string[] | null
  after_hours_agent_available: boolean | null
  after_hours_message: string | null
}

export interface KnowledgeDocument {
  id: string
  company_id: string | null
  filename: string
  file_type: string
  file_size: number | null
  r2_key: string | null
  r2_url: string | null
  embedding_status: string | null
  created_at: Date | null
}

// ─── n8n Response Types ───────────────────────────────────────────────────────

export interface ChatResponse {
  response: string
  session_id: string
  ticket_id: string
  escalate: boolean
  score: number
  category: string
  sentiment: string
}

export interface SuggestResponse {
  suggestions: string[]
}

export interface RouteResponse {
  action: 'continue_ai' | 'escalate_human'
  score: number
  reason?: string
}

export interface EscalateResponse {
  success: boolean
  agent_id?: string
}

// ─── API Request/Response Types ───────────────────────────────────────────────

export interface ApiError {
  error: string | Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface StatCard {
  label: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
}

export interface TicketWithRelations extends Ticket {
  customer?: User | null
  agent?: User | null
  messages?: Message[]
}

export interface AgentWithUser extends Agent {
  user?: User | null
}
