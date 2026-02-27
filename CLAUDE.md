# CLAUDE.md — Area50 Frontend
> **Read this entire file before writing a single line of code.**
> This is the single source of truth for building the Area50 frontend.
> Every decision — architecture, design, naming, testing — is defined here.

---

## 1. What Is Area50

Area50 is a **multi-tenant Hybrid AI + Human Customer Care SaaS platform**.
Businesses subscribe to deploy AI-powered customer support that handles routine
queries automatically while escalating complex issues to human agents.

It supports **web chat, WhatsApp, and voice calls** — all orchestrated through
n8n workflows running on a self-hosted VPS.

**This repo is the Next.js frontend only.** All AI operations, routing, workflow
logic, and credit deduction live in n8n. Next.js communicates with n8n exclusively
through server-side API routes — never from the browser directly.

### User Types
| Role | Access | Description |
|---|---|---|
| `super_admin` | Super Admin Panel | Area50 internal team — manages all companies |
| `admin` | Admin Dashboard | Company admin — manages their company |
| `agent` | Agent Console | Human support agent — handles escalated tickets |
| `customer` | Widget only | End user — interacts via embedded widget |
| `maintenance` | Team App | Field worker — receives tasks via internal chat |

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 14.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | Latest |
| Animations | Framer Motion | 11.x |
| Database | Supabase Postgres via Drizzle ORM | Latest |
| Auth | Clerk | Latest |
| Payments | Paystack (Node SDK direct) | Latest |
| File Storage | Cloudflare R2 (via AWS S3 SDK) | Latest |
| Server State | TanStack Query v5 | 5.x |
| Client State | Zustand | 4.x |
| Forms | React Hook Form + Zod | Latest |
| Charts | Recharts | Latest |
| Toasts | Sonner | Latest |
| Icons | Lucide React | Latest |
| Testing | Vitest + React Testing Library + Playwright | Latest |
| Hosting | Vercel | — |

### Key packages to install
```bash
npx create-next-app@14 area50 --typescript --tailwind --app
npx shadcn-ui@latest init
npm install framer-motion
npm install @clerk/nextjs
npm install drizzle-orm @supabase/supabase-js postgres
npm install -D drizzle-kit
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form zod @hookform/resolvers
npm install recharts
npm install sonner
npm install lucide-react
npm install date-fns clsx class-variance-authority tailwind-merge
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

---

## 3. Design System

### 3.1 Fonts
```css
/* Headings — Clash Display (from Fontshare CDN) */
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap');

/* Body — DM Sans (Google Fonts) */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
```
**Never use Inter, Roboto, Arial, or system fonts.**

### 3.2 Color Palette
From the UI mockups — deep navy primary, light dashboard backgrounds, pink/magenta CTA accent.

```css
/* globals.css */
:root {
  /* Brand */
  --brand-navy: #1B2A4A;
  --brand-navy-light: #243460;
  --brand-pink: #E91E8C;
  --brand-pink-light: #FF6BB5;
  --brand-pink-muted: #FDE7F3;

  /* Neutrals */
  --neutral-50: #F9FAFB;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-400: #9CA3AF;
  --neutral-600: #4B5563;
  --neutral-800: #1F2937;
  --neutral-900: #111827;

  /* Semantic */
  --success: #10B981;
  --success-bg: #D1FAE5;
  --warning: #F59E0B;
  --warning-bg: #FEF3C7;
  --error: #EF4444;
  --error-bg: #FEE2E2;
  --info: #3B82F6;
  --info-bg: #DBEAFE;
}
```

### 3.3 Design Language Per Interface

**Landing Page:**
- Dark navy hero with subtle noise texture
- Light grey feature sections
- Pink CTAs with Framer Motion hover animations
- Editorial feel, generous whitespace
- Animated widget preview mockup in hero

**Admin Dashboard (from UI mockups):**
- White content area on `#F9FAFB` background
- Deep navy left sidebar (`#1B2A4A`) with white icons/text
- Active nav item has pink left border + pink text
- White cards with subtle grey border and drop shadow
- Green dot = connected/online, yellow = syncing/away, red = error/offline
- Clean data tables with filter tab rows above

**Agent Console:**
- Compact high-density layout
- Split view: left = chat, right = context panel
- Framer Motion message entrance animations
- Dark mode preferred

**Customer Widget:**
- Minimal, configurable to client's brand color
- Floating bottom-right chat bubble with pulse animation
- 380px wide, mobile-first
- Colors from `companies.widget_color`

### 3.4 Status Colors
```typescript
export const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

export const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export const sentimentColors = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-600',
  negative: 'bg-orange-100 text-orange-700',
  angry: 'bg-red-100 text-red-700',
}
```

---

## 4. Complete Folder Structure

```
area50/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                              # Landing page
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                        # Sidebar + topbar layout
│   │   ├── dashboard/page.tsx
│   │   ├── tickets/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── agents/page.tsx
│   │   ├── knowledge/page.tsx
│   │   ├── integrations/page.tsx
│   │   ├── widget/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── team-chat/page.tsx
│   │   └── users/page.tsx
│   │
│   ├── (agent)/
│   │   ├── layout.tsx
│   │   ├── agent/page.tsx
│   │   ├── agent/queue/page.tsx
│   │   └── agent/chat/[ticketId]/page.tsx
│   │
│   ├── (super-admin)/
│   │   ├── layout.tsx
│   │   └── super-admin/
│   │       ├── page.tsx
│   │       ├── organizations/page.tsx
│   │       ├── credits/page.tsx
│   │       └── system/page.tsx
│   │
│   ├── widget/page.tsx                       # Public embeddable widget
│   │
│   └── api/
│       ├── chat/route.ts
│       ├── suggest/route.ts
│       ├── ticket/
│       │   ├── route/route.ts
│       │   └── escalate/route.ts
│       ├── knowledge/
│       │   ├── upload/route.ts
│       │   └── search/route.ts
│       ├── vapi/
│       │   ├── assistant/route.ts
│       │   └── outbound/route.ts
│       ├── credits/
│       │   └── deduct/route.ts
│       ├── payment/
│       │   ├── initialize/route.ts
│       │   ├── verify/route.ts
│       │   └── webhook/route.ts
│       └── webhooks/
│           ├── clerk/route.ts
│           └── whatsapp/route.ts
│
├── components/
│   ├── ui/                                   # shadcn/ui — do not edit manually
│   │
│   ├── landing/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ProblemBar.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Features.tsx
│   │   ├── Channels.tsx
│   │   ├── Pricing.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CtaBanner.tsx
│   │   └── Footer.tsx
│   │
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── TicketTable.tsx
│   │   ├── TicketCard.tsx
│   │   ├── TicketFilters.tsx
│   │   ├── TicketDetail.tsx
│   │   ├── AgentCard.tsx
│   │   ├── AgentStatusBadge.tsx
│   │   ├── CreditMeter.tsx
│   │   ├── UsageChart.tsx
│   │   ├── KnowledgeUpload.tsx
│   │   ├── KnowledgeDocList.tsx
│   │   ├── WidgetPreview.tsx
│   │   ├── EmbedCodeBlock.tsx
│   │   ├── PricingTable.tsx
│   │   └── RoutingRulesForm.tsx
│   │
│   ├── agent/
│   │   ├── AgentStatusToggle.tsx
│   │   ├── QueueItem.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── SuggestionPanel.tsx
│   │   ├── CustomerInfoPanel.tsx
│   │   └── TicketActionsBar.tsx
│   │
│   ├── widget/
│   │   ├── WidgetLauncher.tsx
│   │   ├── WidgetContainer.tsx
│   │   ├── WidgetHeader.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── WidgetInput.tsx
│   │   ├── AiResponseActions.tsx
│   │   ├── HumanHandoff.tsx
│   │   ├── TicketView.tsx
│   │   └── NotificationsArea.tsx
│   │
│   └── shared/
│       ├── RoleGuard.tsx
│       ├── LoadingSpinner.tsx
│       ├── LoadingSkeleton.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── ConfirmDialog.tsx
│       ├── StatusBadge.tsx
│       └── PriorityBadge.tsx
│
├── lib/
│   ├── n8n.ts
│   ├── db.ts
│   ├── schema.ts
│   ├── r2.ts
│   ├── paystack.ts
│   ├── auth.ts
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
│
├── hooks/
│   ├── useTickets.ts
│   ├── useTicket.ts
│   ├── useAgentQueue.ts
│   ├── useCredits.ts
│   ├── useAgents.ts
│   ├── useKnowledge.ts
│   ├── useSession.ts
│   ├── useWidget.ts
│   └── useAgentStatus.ts
│
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── n8n.test.ts
│   │   │   ├── paystack.test.ts
│   │   │   ├── r2.test.ts
│   │   │   └── auth.test.ts
│   │   └── components/
│   │       ├── StatusBadge.test.tsx
│   │       ├── CreditMeter.test.tsx
│   │       ├── TicketCard.test.tsx
│   │       └── MessageBubble.test.tsx
│   ├── integration/
│   │   └── api/
│   │       ├── chat.test.ts
│   │       ├── ticket-route.test.ts
│   │       ├── ticket-escalate.test.ts
│   │       ├── knowledge-upload.test.ts
│   │       ├── payment-initialize.test.ts
│   │       ├── payment-verify.test.ts
│   │       └── payment-webhook.test.ts
│   └── e2e/
│       ├── landing.spec.ts
│       ├── auth.spec.ts
│       ├── onboarding.spec.ts
│       ├── dashboard.spec.ts
│       ├── tickets.spec.ts
│       ├── knowledge.spec.ts
│       ├── agent-queue.spec.ts
│       ├── agent-chat.spec.ts
│       ├── billing.spec.ts
│       └── widget.spec.ts
│
├── public/
│   └── embed.js
│
├── drizzle/
│   └── migrations/
│
├── drizzle.config.ts
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── .env.local
```

---

## 5. Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Supabase Postgres — ALWAYS use pooler URL for Vercel
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# n8n — server-side only, NEVER NEXT_PUBLIC
N8N_WEBHOOK_BASE_URL=https://n8n.srv1194565.hstgr.cloud
N8N_SECRET=area50_sk_Xp9mK2vQ8nL4wR7j

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=area50-files
NEXT_PUBLIC_R2_PUBLIC_URL=https://files.yourdomain.com

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

# Vapi (client-side SDK)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=

# App
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

---

## 6. Drizzle Schema (lib/schema.ts)

Mirror the existing Postgres tables exactly. Key tables shown below:

```typescript
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, time } from 'drizzle-orm/pg-core'

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

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).unique(),
  company_id: uuid('company_id').references(() => companies.id),
  status: varchar('status', { length: 20 }).default('offline'),
  max_concurrent_chats: integer('max_concurrent_chats').default(3),
  active_chats: integer('active_chats').default(0),
  total_resolved: integer('total_resolved').default(0),
  avg_response_time: integer('avg_response_time').default(0),
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
})
```

---

## 7. The n8n Helper

**ONLY way to reach n8n — used exclusively in API routes, never in components.**

```typescript
// lib/n8n.ts
const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL
const SECRET = process.env.N8N_SECRET

export async function callN8n<T = unknown>(route: string, payload: object): Promise<T> {
  const res = await fetch(`${N8N_BASE}${route}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-area50-secret': SECRET!,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`n8n error on ${route}: ${res.status} ${res.statusText}`)
  return res.json()
}
```

### n8n Webhook Route Reference

| Route | API Route | Key Payload Fields |
|---|---|---|
| `/webhook/ai/chat` | `api/chat` | `ticket_id, session_id, message, company_id, channel, language` |
| `/webhook/ai/suggest` | `api/suggest` | `ticket_id, company_id, context` |
| `/webhook/ticket/route` | `api/ticket/route` | `ticket_id, message, company_id, session_id, message_count` |
| `/webhook/ticket/escalate` | `api/ticket/escalate` | `ticket_id, company_id, score, reason, category, sentiment` |
| `/webhook/knowledge/ingest` | `api/knowledge/upload` | `company_id, document_id, file_url, file_type, filename` |
| `/webhook/knowledge/search` | `api/knowledge/search` | `company_id, query` |
| `/webhook/vapi/assistant/get` | `api/vapi/assistant` | `company_id` |
| `/webhook/vapi/outbound` | `api/vapi/outbound` | `company_id, customer_phone, ticket_id` |
| `/webhook/credits/deduct` | `api/credits/deduct` | `company_id, type, amount, reference` |

---

## 8. Data Fetching Rules

| Operation | Method |
|---|---|
| Load ticket list, detail | Drizzle → Postgres directly |
| Load customer/agent/company info | Drizzle → Postgres directly |
| Credit balance display | Drizzle → Postgres directly |
| Agent queue, status | Drizzle → Postgres directly |
| Update agent status | Drizzle → Postgres directly |
| Close/reopen ticket (no AI) | Drizzle → Postgres directly |
| AI chat response | `api/chat` → n8n |
| Ticket routing/scoring | `api/ticket/route` → n8n |
| Escalate to human | `api/ticket/escalate` → n8n |
| KB ingestion | `api/knowledge/upload` → R2 → n8n |
| AI agent suggestions | `api/suggest` → n8n |
| Credit deduction | `api/credits/deduct` → n8n |
| Voice call trigger | `api/vapi/outbound` → n8n |

---

## 9. Auth & Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/widget(.*)',
  '/api/webhooks/(.*)',
  '/api/payment/webhook',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

```typescript
// lib/auth.ts
import { auth } from '@clerk/nextjs/server'
import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
  const { userId } = auth()
  if (!userId) return null
  return db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
}

export async function requireRole(...roles: string[]) {
  const user = await getCurrentUser()
  if (!user || !roles.includes(user.role)) throw new Error('Unauthorized')
  return user
}
```

---

## 10. API Route Pattern

```typescript
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { callN8n } from '@/lib/n8n'

const Schema = z.object({
  company_id: z.string().uuid(),
  message: z.string().min(1).max(5000),
  session_id: z.string(),
  ticket_id: z.string().uuid(),
  channel: z.enum(['web_widget', 'whatsapp', 'voice_inbound']),
  language: z.string().default('en'),
})

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await callN8n('/webhook/ai/chat', parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 11. Page-by-Page UI Specification

### 11.1 Landing Page (`app/page.tsx`)
**Audience:** B2B — CTOs, ops managers, business owners. **Goal:** Trial or demo booking.

| Section | Key Elements |
|---|---|
| Navbar | Logo, Features/Pricing/Docs links, Login button, pink "Get Started" CTA. Sticky, transparent → solid white on scroll |
| Hero | Dark navy bg. "AI That Handles Support. Humans That Close Deals." Bold headline. Two CTAs: "Start Free Trial" (pink) + "Book Demo" (outline). Animated widget mockup on right. Framer Motion entrance animation |
| Problem Bar | Light strip. 3 animated stats: "73% of support queries are repetitive", "Human agents cost 8x more than AI", "Customers wait 4+ minutes on average" |
| How It Works | 3-step flow with connecting arrows: Customer sends message → AI handles or routes → Human takes over seamlessly. Animated on scroll |
| Features | 6 cards in grid: Hybrid AI+Human, Smart Routing, Voice Calls, WhatsApp, Knowledge Base RAG, Multi-tenant. Hover lift + shadow |
| Channels | Dark bg section. Web widget, WhatsApp, Phone call visual showcase with device mockups |
| Pricing | 3 plan cards (Starter ₦15k / Growth ₦35k / Business ₦80k). Growth card highlighted. Credit costs table below |
| Testimonials | 3 testimonial cards with avatar, quote, company |
| CTA Banner | Pink bg. "Start your free trial today." Email input + button |
| Footer | 4 column links (Product, Company, Developers, Legal). Navy bg. Social icons |

### 11.2 Onboarding (`(auth)/onboarding/page.tsx`)
Multi-step wizard, progress bar at top:
1. Company name + support email
2. Choose plan (Starter / Growth / Business)
3. AI personality — large textarea ("Describe how your AI should speak to customers")
4. Widget color picker + welcome message preview
5. Upload first KB document (skip option available)
6. Done → redirect to `/dashboard`

### 11.3 Admin Dashboard Home (`dashboard/page.tsx`)

**Stats Cards Row:** Total Tickets | Open Tickets | Resolved Today | Credits Remaining (with low-balance warning)

**Quick Action Cards (2×4 grid from UI mockup):**
View Tickets | Usage Analytics | Add Team Member | Configure Widget | Upload Company Data | Call Settings | Agent Management | Credit Top-up

**Recent Activity Feed:** Last 10 ticket events with avatar, description, timestamp

**Sidebar Navigation (navy, from UI mockups):**
- Dashboard (active = pink left border)
- Tickets
- AI Knowledge Base
- Human Agents
- Team Chat
- Call Settings
- Widget Customization
- Users & Roles
- Credits & Billing
- Settings
- (bottom) Logout

### 11.4 Tickets Page (`dashboard/tickets/page.tsx`)

**Top actions bar:** Create Ticket button | Search input | Filter dropdown

**Filter Tabs:** All | Open | In Progress | Resolved | Closed | High Priority | By Agent | By AI | Awaiting Human

**Table columns:** # | Customer | Channel (icon) | Status (badge) | Priority (badge) | Category | Complexity Score | Assigned To | Created | Actions

**Per-row actions:** Assign AI/Human | Escalate | Add Note | Transfer | Close | Delete

**Bulk actions (when rows selected):** Assign | Close | Delete | Export

### 11.5 Ticket Detail (`dashboard/tickets/[id]/page.tsx`)

**Left (60%):** Full chat history. Customer messages (right-aligned, brand color bg). AI messages (left, grey bg, "AI" label). Agent messages (left, blue bg, "Agent" label).

**Right (40%):** Ticket metadata panel
- Status + Priority selectors
- Assigned To (AI / agent selector)
- Complexity score display
- Sentiment badge
- AI Summary (collapsible)
- Customer info (name, email, phone, ticket history count)

**Action buttons below metadata:**
Edit Details | View AI Summary | Download Transcript | Call Team | Forward to Chat | Add Attachment | Set Priority | Assign to Human Agent

### 11.6 Agents Page (`dashboard/agents/page.tsx`)

**Per-agent card:**
- Name + avatar
- Status badge: Online (green) / Away (yellow) / Offline (grey)
- Active chats count / max concurrent chats
- Specializations tags (billing, technical, complaint)
- Performance: Avg response time, Total resolved, Resolution rate
- Actions: Edit, Remove, View Queue

**Page-level controls:**
- Auto-assign toggle (on/off)
- Manual assign mode
- Add Agent button

### 11.7 Knowledge Base (`dashboard/knowledge/page.tsx`)

**From UI mockup — split layout:**

Left/Main: Quick Upload area (drag-drop box) showing accepted file types (.pdf .txt .csv .docx). Processing Queue below showing file name, progress bar, "Embedding..." status, X to cancel.

Right: Data Sources panel showing connected sources (e.g. Notion Workspace with doc count, Google Drive syncing). "Add External Source" button.

**Uploaded Documents table:**
File Name | Type icon | Size | Date Added | Embedding Status (Completed/Error/Processing) | Link to Agent | Actions

**Action buttons:** Upload Document | Add FAQ | Add Custom Q&A | Rebuild Embeddings | Sync Data | Delete Document | Preview Extract

**Filter tabs:** PDFs | Manuals | Internal Updates | Training History | Recent

**Storage usage bar** at top showing GB used of total.

### 11.8 Integrations Page (`dashboard/integrations/page.tsx`)

**From UI mockups — Marketplace tab + Connected tab.**

Layout: Left sidebar categories + right card grid.

**Categories sidebar:** All Apps | Messaging | CRM | Productivity | Custom Webhooks

**Integration cards from mockup:**
- Slack — "Seamlessly interact with agents directly in your team channels" — CONNECTED badge → Configure button
- GitHub — "Trigger agent actions on pull requests, issues, and commits" — CONNECTED badge → Configure button
- WhatsApp Business — "Deploy agents to over 2 billion users" — Install Integration button
- Salesforce — "Two-way sync for leads, contacts, and opportunities" — Install Integration button
- HubSpot — "Connect your marketing and sales pipelines" — Install Integration button
- Zapier — "Unlock 5,000+ apps. Create complex multi-step workflows" — Install Integration button

**Connected tab:** Shows only installed integrations with config forms.

**Search bar** in top right.

**Badge counter** on nav item showing number connected (e.g. "6").

### 11.9 Widget Customizer (`dashboard/widget/page.tsx`)

**Controls panel (left):**
- Color picker → live updates widget preview
- Avatar upload (R2) → shows in widget header
- Welcome message textarea
- Enable Ticket View toggle
- Enable File Uploads toggle
- Configure AI-Human Handoff (threshold slider)

**Live Preview (right):**
- Iframe showing actual widget with current settings

**Embed Code section (bottom):**
- Copyable HTML snippet with company_id injected
- "Copy Code" button with success toast

### 11.10 Analytics (`dashboard/analytics/page.tsx`)

**Date range picker** at top (7 days / 30 days / 90 days / custom)

**Charts:**
- Messages over time: Line chart (AI vs Human split)
- Channel breakdown: Bar chart (web_widget / whatsapp / voice)
- Resolution rate trend: Area chart
- Cost per ticket: Line chart showing credit spend
- AI vs Human resolution: Donut/pie chart
- Avg response time: Bar chart

### 11.11 Billing (`dashboard/billing/page.tsx`)

**Current plan card:** Plan name, renewal date, credits balance with CreditMeter bar

**Top-Up Credits button:** Opens Paystack modal

**Plan cards:** Starter ₦15k (5,000 credits) | Growth ₦35k (15,000 credits) | Business ₦80k (40,000 credits). "Current Plan" badge on active. "Upgrade" button on others.

**Credit Pack buttons:** Small ₦5k (1,500) | Medium ₦10k (3,500) | Large ₦20k (8,000)

**Usage Breakdown table:** Operation | Credits Used | Count | Total

**Payment History table:** Date | Reference | Amount | Credits | Status (Success/Pending/Failed) | Download Invoice

### 11.12 Settings (`dashboard/settings/page.tsx`)

**Tabs:**
- Company Profile — name, email, logo upload
- AI Personality — large textarea, save button
- Notifications — email alerts, low credit threshold input
- Security — API keys display, regenerate button
- Human Agent Settings — routing rules form (threshold, keywords, hours)
- Integrations — quick links to integrations page
- Danger Zone — Delete Organization (confirm dialog)

### 11.13 Team Chat (`dashboard/team-chat/page.tsx`)

**Left:** Channel list (groups). Create Group button.

**Right:** Active chat with message history, send input.

**Per message actions:** Reply | Forward to Ticket | AI Summarize | Save to Knowledge Base

**Group controls:** Add Member | Remove Member | Mute | Archive | Export | Promote Admin | Delete

### 11.14 Users & Roles (`dashboard/users/page.tsx`)

**Actions:** Add User | Invite Link button

**Per-user row:** Name | Email | Role (dropdown) | Status | Last Login | Actions (Reset Password | Suspend | Delete | View Login History)

### 11.15 Agent Queue (`(agent)/agent/queue/page.tsx`)

**Status toggle at top:** Online (green) | Away (yellow) | Offline (grey) — updates `agents.status`

**Queue stats bar:** Active Chats | Queue Depth | Avg Wait Time

**Ticket queue list, sorted by priority then wait time:**
- Customer name + avatar
- Channel icon (web/WA/phone)
- Wait time (e.g. "4 mins")
- Priority badge
- Issue snippet (first message truncated)
- "Claim" button → routes to `/agent/chat/[ticketId]`

### 11.16 Agent Chat (`(agent)/agent/chat/[ticketId]/page.tsx`)

**Left panel (60%) — Chat:**
- Message history: customer (right, navy bg), AI (left, grey, "AI" badge), agent (right, pink bg)
- Framer Motion entrance per message
- Text input with Send button
- "Call Customer" button: `tel:{customer.phone}` OR trigger Vapi outbound

**Right panel (40%) — Context:**
- Customer Info: name, email, phone, previous tickets count
- Ticket Details: channel, complexity score badge, sentiment badge, category, created time
- AI Summary (collapsible card)
- AI Suggestions (3 suggested reply cards, click to insert into input)
- Action buttons: Resolve ✓ | Escalate ↑ | Transfer → | Add Note 📝

### 11.17 Customer Widget (`widget/page.tsx`)

Public, no auth. Receives `?company_id=xxx`. Widget color from `companies.widget_color`.

**States:**

**1. Launcher (default):**
Floating button bottom-right. Pulse animation ring. Company avatar or chat icon. Click → open widget.

**2. Widget Open — Chat View:**
- Header: Company logo/avatar + name, Back button, Close (X), End Chat, Transfer to Human
- Message list: scrollable, customer right / AI left
- AI message has action row: 👍 Helpful | 👎 Not Helpful | Create Ticket | Talk to Human
- Input: textarea + Send button + Attachment icon + optional Voice Note button

**3. Human Handoff View:**
"Connecting you to a support agent..." with spinner. Queue position shown. "Continue with AI" fallback.

**4. Ticket View:**
Ticket ID, status badge, last update. Buttons: Add Details | Upload Picture | Cancel Ticket | Close Ticket

**5. Notifications:**
List of status updates with timestamps. "View Summary" expands AI-generated summary.

### 11.18 Super Admin Panel (`(super-admin)/super-admin/`)

**Overview page:** Platform health, total companies, total tickets, total revenue, system status

**Organizations page:** All companies table. Create Organization | Delete | Disable | Reset Credits | Edit per row

**Credits page:** Global credit ledger. Per-company balance. Reset credits form.

**System page:** AI model config (GPT-4o settings), System Logs viewer, Update System button

---

## 12. Paystack Integration

```typescript
// lib/paystack.ts
const SECRET = process.env.PAYSTACK_SECRET_KEY

export async function initializeTransaction(params: {
  email: string
  amount: number  // kobo (NGN * 100)
  metadata?: Record<string, unknown>
}) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return res.json()
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${SECRET}` },
  })
  return res.json()
}
```

**Credit costs (lib/constants.ts):**
```typescript
export const CREDIT_COSTS = {
  ai_message: 1,
  human_message: 3,
  voice_minute: 10,
  outbound_call_flat: 5,
  kb_embed: 5,
} as const

export const PLANS = {
  starter:  { price_kobo: 1_500_000, credits: 5_000,  name: 'Starter'  },
  growth:   { price_kobo: 3_500_000, credits: 15_000, name: 'Growth'   },
  business: { price_kobo: 8_000_000, credits: 40_000, name: 'Business' },
} as const

export const CREDIT_PACKS = [
  { price_kobo: 500_000,   credits: 1_500, label: 'Small'  },
  { price_kobo: 1_000_000, credits: 3_500, label: 'Medium' },
  { price_kobo: 2_000_000, credits: 8_000, label: 'Large'  },
]
```

---

## 13. File Upload (Cloudflare R2)

```typescript
// lib/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadFile(companyId: string, file: Buffer, filename: string, contentType: string) {
  const documentId = randomUUID()
  const key = `${companyId}/${documentId}/${filename}`
  await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: file, ContentType: contentType }))
  return { key, documentId, url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}` }
}

export async function getSignedDownloadUrl(key: string) {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }), { expiresIn: 3600 })
}
```

**Allowed:** `pdf`, `txt`, `csv`, `json`, `docx` — Max: 50MB — Key: `{company_id}/{document_id}/{filename}`

---

## 14. Widget Embed Script

```javascript
// public/embed.js
(function() {
  if (!window.AREA50_COMPANY_ID) { console.warn('Area50: AREA50_COMPANY_ID not set'); return; }
  var iframe = document.createElement('iframe');
  iframe.id = 'area50-widget';
  iframe.src = 'https://app.yourdomain.com/widget?company_id=' + window.AREA50_COMPANY_ID;
  iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;z-index:2147483647;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
  document.body.appendChild(iframe);
})();
```

**Code shown to admins:**
```html
<script>window.AREA50_COMPANY_ID = 'YOUR_COMPANY_ID';</script>
<script src="https://app.yourdomain.com/embed.js" async></script>
```

---

## 15. Testing

### Setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], coverage: { reporter: ['text', 'lcov'] } },
})
```

### Integration test pattern
```typescript
// tests/integration/api/chat.test.ts
import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/chat/route'

vi.mock('@/lib/n8n', () => ({
  callN8n: vi.fn().mockResolvedValue({ response: 'Hello!', session_id: 'sess_123', ticket_id: 'ticket_123', escalate: false, score: 2, category: 'inquiry', sentiment: 'neutral' })
}))
vi.mock('@clerk/nextjs/server', () => ({ auth: () => ({ userId: 'user_test_123' }) }))

describe('POST /api/chat', () => {
  it('returns 200 for valid payload', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: '11111111-1111-1111-1111-111111111111', message: 'What are your office hours?', session_id: 'session-test-001', ticket_id: '33333333-3333-3333-3333-333333333333', channel: 'web_widget', language: 'en' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.response).toBeDefined()
  })

  it('returns 401 when unauthenticated', async () => { /* mock userId: null */ })
  it('returns 400 for invalid payload', async () => { /* missing fields */ })
})
```

```bash
npx vitest run           # all unit + integration
npx vitest --coverage    # with coverage report
npx playwright test      # all e2e
npx playwright test --ui # visual mode
```

---

## 16. Build Order

Build in this exact phase order. Never skip ahead.

| Phase | What to Build |
|---|---|
| 1 — Foundation | Project scaffold, globals.css, Tailwind config, all lib/ files, middleware, Drizzle push |
| 2 — Landing Page | All components/landing/ then app/page.tsx. Establish full design language here. |
| 3 — Auth | Login page (Clerk), Onboarding wizard |
| 4 — Dashboard Shell | Layout with sidebar, Dashboard home page |
| 5 — Core Dashboard | Tickets list → Ticket detail → Knowledge Base → Agents |
| 6 — Agent Console | Queue page → Chat split-view page |
| 7 — Widget | app/widget/page.tsx + public/embed.js |
| 8 — Remaining Dashboard | Analytics → Billing → Settings → Integrations → Widget customizer → Users → Team Chat |
| 9 — Super Admin | All super-admin/ pages |
| 10 — Tests | All unit, integration, and e2e tests |

---

## 17. Strict Rules

### Always
- TypeScript strict — zero `any` types
- Zod validation on every API input
- Clerk auth check in every non-public API route
- Drizzle for all DB queries
- `company_id` filter on every DB query (multi-tenancy)
- `callN8n()` for all n8n communication
- Loading skeleton on every data-fetching component
- Error state with retry on every async operation
- Sonner toasts for all user feedback
- Framer Motion for page transitions + list animations
- Tests for every new API route
- Follow folder structure exactly

### Never
- Call n8n from client/browser components
- `NEXT_PUBLIC_` prefix on any secret
- `any` TypeScript type
- Raw SQL — Drizzle only
- `useEffect` for data fetching — TanStack Query only
- Sensitive data in `localStorage` / `sessionStorage`
- Skip Zod validation
- Inline styles — Tailwind only
- Skip `company_id` filter on DB queries
- Mix admin and agent layouts
- Inter, Roboto, or system fonts

---

## 18. Business Logic

### Ticket Lifecycle
`open` → `in_progress` → `escalated` → `resolved` → `closed`
- New: `status: open`, `assigned_to: ai`
- Escalated: `assigned_to: human`, `status: escalated`
- Resolved: `status: resolved`, `is_resolved: true`

### Credits
- Never deduct from Next.js directly — always via `api/credits/deduct` → n8n
- Read balance directly from Postgres via Drizzle
- Show warning banner when `credits < 500`
- Show urgent alert + disable AI features when `credits <= 0`

### Agent Continue Chat Flow
Escalation in n8n assigns ticket to human → agent sees in queue → clicks "Claim" → `/agent/chat/[ticketId]` → full history loaded → "Call Customer" = `tel:` link or Vapi outbound

### Widget Session
- No localStorage — all state in memory (Zustand)
- Generate UUID `session_id` on widget open
- Every message sends: `session_id`, `company_id`, `ticket_id`
- Colors fetched from `companies.widget_color` on load

---

## 19. n8n VPS Reference

| Item | Value |
|---|---|
| VPS | Hostinger, 2 CPU / 8GB RAM / 100GB disk, France-Paris |
| VPS IP | `72.62.25.73` |
| n8n URL | `https://n8n.srv1194565.hstgr.cloud` |
| Shared secret header | `x-area50-secret: area50_sk_Xp9mK2vQ8nL4wR7j` |
| Test company ID | `11111111-1111-1111-1111-111111111111` |
| Test ticket ID | `33333333-3333-3333-3333-333333333333` |
| Test session ID | `session-test-001` |

### n8n Workflow Status
| WF | Name | Status |
|---|---|---|
| WF1 | AI Chat + RAG | ✅ Done |
| WF3 | Ticket Routing | ⚠️ Postgres integration in progress |
| WF4 | Ticket Escalation | ✅ Done |
| WF5 | KB Ingestion (PDF/TXT/CSV/JSON/DOCX) | ✅ Done |
| WF6 | Knowledge Search | ✅ Done |
| WF2 | AI Suggest | ⬜ Week 2 |
| WF13 | Credits Deduct | ⬜ Week 2 |
| WF7-10 | Vapi Voice | ⬜ Week 2 |
| WF11-12 | WhatsApp | ⬜ Week 2 |

---

## 20. Getting Started

```bash
# 1. Install
git clone <repo> area50 && cd area50 && npm install

# 2. Env
cp .env.example .env.local  # fill in all values from Section 5

# 3. shadcn init
npx shadcn-ui@latest init
# TypeScript: yes | Tailwind: yes | App Router: yes | Components: @/components | Utils: @/lib/utils

# 4. DB
npx drizzle-kit push

# 5. Dev
npm run dev

# 6. Verify n8n connection
curl -X POST https://n8n.srv1194565.hstgr.cloud/webhook/ai/chat \
  -H "Content-Type: application/json" \
  -H "x-area50-secret: area50_sk_Xp9mK2vQ8nL4wR7j" \
  -d '{
    "company_id": "11111111-1111-1111-1111-111111111111",
    "message": "What are your office hours?",
    "session_id": "session-test-001",
    "ticket_id": "33333333-3333-3333-3333-333333333333",
    "channel": "web_widget",
    "language": "en"
  }'
# Expected: AI response with Pinnacle Realty Lagos + Abuja office hours ✅
```

---

*Area50 — Built by Digitalwebtonics*
*CLAUDE.md v2.0 | February 2026*
*Stack: Next.js 14 + Supabase + Vercel + Clerk + Paystack + Cloudflare R2 + n8n VPS*
