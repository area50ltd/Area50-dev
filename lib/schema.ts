import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  time,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  plan: varchar('plan', { length: 50 }).default('starter'),
  credits: integer('credits').default(0),
  language: varchar('language', { length: 10 }).default('en'),
  ai_personality: text('ai_personality'),
  widget_color: varchar('widget_color', { length: 7 }).default('#1B2A4A'),
  widget_avatar: varchar('widget_avatar', { length: 500 }),
  widget_welcome: text('widget_welcome').default('Hello! How can I help you today?'),
  vapi_assistant_id: varchar('vapi_assistant_id', { length: 255 }),
  vapi_phone_number: varchar('vapi_phone_number', { length: 50 }),
  vapi_phone_number_id: varchar('vapi_phone_number_id', { length: 255 }),
  whatsapp_phone_id: varchar('whatsapp_phone_id', { length: 255 }),
  whatsapp_token: text('whatsapp_token'),
  slack_webhook_url: text('slack_webhook_url'),
  voice_language: varchar('voice_language', { length: 10 }).default('en'),
  voice_accent: varchar('voice_accent', { length: 50 }).default('english'),
  voice_gender: varchar('voice_gender', { length: 10 }).default('female'),
  voice_tone: varchar('voice_tone', { length: 20 }).default('professional'),
  elevenlabs_voice_id: varchar('elevenlabs_voice_id', { length: 100 }),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerk_id: varchar('clerk_id', { length: 255 }).unique().notNull(),
  company_id: uuid('company_id').references(() => companies.id),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 50 }).notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
})

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  company_id: uuid('company_id').references(() => companies.id),
  customer_id: uuid('customer_id').references(() => users.id),
  agent_id: uuid('agent_id').references(() => users.id),
  channel: varchar('channel', { length: 50 }),
  status: varchar('status', { length: 50 }).default('open'),
  assigned_to: varchar('assigned_to', { length: 50 }).default('ai'),
  priority: varchar('priority', { length: 20 }).default('normal'),
  category: varchar('category', { length: 100 }),
  complexity_score: integer('complexity_score').default(0),
  ai_summary: text('ai_summary'),
  sentiment: varchar('sentiment', { length: 20 }),
  language: varchar('language', { length: 10 }).default('en'),
  session_id: varchar('session_id', { length: 255 }),
  is_resolved: boolean('is_resolved').default(false),
  resolved_at: timestamp('resolved_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticket_id: uuid('ticket_id').references(() => tickets.id),
  company_id: uuid('company_id').references(() => companies.id),
  sender_type: varchar('sender_type', { length: 20 }).notNull(), // 'customer' | 'ai' | 'agent'
  sender_id: uuid('sender_id'),
  content: text('content').notNull(),
  is_helpful: boolean('is_helpful'),
  created_at: timestamp('created_at').defaultNow(),
})

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).unique(),
  company_id: uuid('company_id').references(() => companies.id),
  status: varchar('status', { length: 20 }).default('offline'),
  max_concurrent_chats: integer('max_concurrent_chats').default(3),
  active_chats: integer('active_chats').default(0),
  total_resolved: integer('total_resolved').default(0),
  avg_response_time: integer('avg_response_time').default(0),
  specializations: text('specializations').array().default(sql`'{}'::text[]`),
  created_at: timestamp('created_at').defaultNow(),
})

export const routing_rules = pgTable('routing_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  company_id: uuid('company_id').references(() => companies.id),
  complexity_threshold: integer('complexity_threshold').default(6),
  business_hours_start: time('business_hours_start').default('08:00'),
  business_hours_end: time('business_hours_end').default('18:00'),
  timezone: varchar('timezone', { length: 50 }).default('Africa/Lagos'),
  after_hours_mode: varchar('after_hours_mode', { length: 50 }).default('ai_only'),
  max_ai_attempts: integer('max_ai_attempts').default(3),
  keywords_escalate: text('keywords_escalate').array().default(sql`'{}'::text[]`),
  after_hours_agent_available: boolean('after_hours_agent_available').default(false),
  after_hours_message: text('after_hours_message'),
})

export const knowledge_documents = pgTable('knowledge_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  company_id: uuid('company_id').references(() => companies.id),
  filename: varchar('filename', { length: 500 }).notNull(),
  file_type: varchar('file_type', { length: 20 }).notNull(),
  file_size: integer('file_size'),
  r2_key: varchar('r2_key', { length: 1000 }),
  r2_url: varchar('r2_url', { length: 1000 }),
  embedding_status: varchar('embedding_status', { length: 20 }).default('pending'), // pending | processing | completed | error
  created_at: timestamp('created_at').defaultNow(),
})

export const credit_transactions = pgTable('credit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  company_id: uuid('company_id').references(() => companies.id),
  type: varchar('type', { length: 50 }).notNull(), // ai_message | human_message | voice_minute | kb_embed | top_up
  amount: integer('amount').notNull(), // positive = credit added, negative = deducted
  reference: varchar('reference', { length: 255 }),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
})

export const team_channels = pgTable('team_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  company_id: uuid('company_id').references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
})

export const team_messages = pgTable('team_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  channel_id: uuid('channel_id').references(() => team_channels.id),
  company_id: uuid('company_id').references(() => companies.id),
  user_id: uuid('user_id').references(() => users.id),
  author_name: varchar('author_name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow(),
})

export const payment_transactions = pgTable('payment_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  company_id: uuid('company_id').references(() => companies.id),
  paystack_reference: varchar('paystack_reference', { length: 255 }).unique(),
  amount_kobo: integer('amount_kobo').notNull(),
  credits_purchased: integer('credits_purchased').notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending | success | failed
  created_at: timestamp('created_at').defaultNow(),
})

export const platform_settings = pgTable('platform_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value'),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  price_kobo: integer('price_kobo').notNull().default(0),
  credits: integer('credits').notNull().default(0),
  is_active: boolean('is_active').default(true),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const credit_packs = pgTable('credit_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: varchar('label', { length: 100 }).notNull(),
  price_kobo: integer('price_kobo').notNull(),
  credits: integer('credits').notNull(),
  is_active: boolean('is_active').default(true),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})
