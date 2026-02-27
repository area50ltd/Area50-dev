# Area50 Build Plan
> Generated: 2026-02-25 | Status: Ready to execute

---

## Current State
- Only `CLAUDE.md` and `external/old.yaml` exist
- Zero code, zero scaffold, zero config
- Ready to build from scratch per CLAUDE.md spec

---

## Phase Overview

| Phase | Name | Deliverables | Priority |
|---|---|---|---|
| 1 | Foundation | Scaffold + all lib/ files + middleware + DB push | Critical |
| 2 | Landing Page | Full B2B landing with Framer Motion | High |
| 3 | Auth | Login + Onboarding wizard | High |
| 4 | Dashboard Shell | Sidebar + TopBar + Dashboard home | High |
| 5 | Core Dashboard | Tickets + Ticket Detail + Knowledge Base + Agents | High |
| 6 | Agent Console | Queue + Chat split-view | High |
| 7 | Widget | Embeddable widget + embed.js | High |
| 8 | Remaining Dashboard | Analytics + Billing + Settings + Integrations + Widget Customizer + Users + Team Chat | Medium |
| 9 | Super Admin | Overview + Organizations + Credits + System | Medium |
| 10 | Tests | Unit + Integration + E2E | Medium |

---

## Phase 1 — Foundation

### Step 1.1: Scaffold (Run first, manual)
```bash
# In c:\softwares\Area50\Area50app (must be run in parent dir)
npx create-next-app@14 . --typescript --tailwind --app --no-git
npx shadcn-ui@latest init
```
> Answer shadcn prompts: TypeScript: yes | Tailwind: yes | App Router: yes | Components: @/components | Utils: @/lib/utils

### Step 1.2: Install all dependencies
```bash
npm install framer-motion @clerk/nextjs drizzle-orm @supabase/supabase-js postgres
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install recharts sonner lucide-react
npm install date-fns clsx class-variance-authority tailwind-merge
npm install -D drizzle-kit
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

### Step 1.3: Config Files
- `tailwind.config.ts` — custom font family + brand color extensions
- `app/globals.css` — CSS vars (brand colors, fonts) + @import for Clash Display + DM Sans
- `next.config.ts` — standard Next.js 14 config
- `drizzle.config.ts` — points to DATABASE_URL, schema at lib/schema.ts
- `vitest.config.ts` — jsdom environment, setup file
- `playwright.config.ts` — base URL localhost:3000
- `.env.local` — all vars from CLAUDE.md section 5 (empty placeholders)

### Step 1.4: Core lib/ Files (9 files)
| File | Content |
|---|---|
| `lib/db.ts` | Drizzle + Supabase postgres connection (pooler URL) |
| `lib/schema.ts` | 5 tables: companies, users, tickets, agents, routing_rules |
| `lib/n8n.ts` | `callN8n()` helper — exact code from CLAUDE.md §7 |
| `lib/r2.ts` | `uploadFile()` + `getSignedDownloadUrl()` — exact code from CLAUDE.md §13 |
| `lib/paystack.ts` | `initializeTransaction()` + `verifyTransaction()` — exact code from CLAUDE.md §12 |
| `lib/auth.ts` | `getCurrentUser()` + `requireRole()` — exact code from CLAUDE.md §9 |
| `lib/types.ts` | TypeScript interfaces for Company, User, Ticket, Agent, Message, RoutingRule |
| `lib/constants.ts` | CREDIT_COSTS + PLANS + CREDIT_PACKS + statusColors + priorityColors + sentimentColors |
| `lib/utils.ts` | `cn()` classname merger, formatDate, formatCurrency, truncate |

### Step 1.5: Middleware
- `middleware.ts` — Clerk middleware, exact code from CLAUDE.md §9
- Protects all routes except: `/`, `/login(.*)`, `/widget(.*)`, `/api/webhooks/(.*)`, `/api/payment/webhook`

### Step 1.6: Root Layout
- `app/layout.tsx` — ClerkProvider wrapping, TanStack QueryProvider, font CSS vars, Sonner toaster

### Step 1.7: DB Push
```bash
npx drizzle-kit push
```

---

## Phase 2 — Landing Page

### Components (10 files in `components/landing/`)
| Component | Key Details |
|---|---|
| `Navbar.tsx` | Sticky, transparent → solid white on scroll. Logo + nav links + Login + pink CTA |
| `Hero.tsx` | Dark navy bg. Bold headline. Framer Motion entrance. Widget mockup on right. Two CTAs |
| `ProblemBar.tsx` | 3 animated counter stats (73%, 8x, 4+ minutes) |
| `HowItWorks.tsx` | 3-step flow with arrows. Animated on scroll (Framer Motion whileInView) |
| `Features.tsx` | 6 feature cards grid. Hover lift + shadow animation |
| `Channels.tsx` | Dark bg. Web/WhatsApp/Voice device mockups |
| `Pricing.tsx` | 3 plan cards (Starter ₦15k / Growth ₦35k / Business ₦80k). Growth highlighted |
| `Testimonials.tsx` | 3 testimonial cards with avatar + quote + company |
| `CtaBanner.tsx` | Pink bg. Email input + "Start Free Trial" button |
| `Footer.tsx` | 4-column links. Navy bg. Social icons |

### Page
- `app/page.tsx` — assembles all 10 landing sections in order

---

## Phase 3 — Auth

### Pages
- `app/(auth)/login/page.tsx` — Clerk `<SignIn>` component, branded navy/pink theme
- `app/(auth)/onboarding/page.tsx` — 6-step wizard:
  1. Company name + support email
  2. Choose plan (Starter / Growth / Business) — card selection
  3. AI personality textarea
  4. Widget color picker + welcome message + live preview
  5. Upload first KB document (drag-drop, skip available)
  6. Done → redirect `/dashboard`
  - Progress bar at top, Framer Motion step transitions

---

## Phase 4 — Dashboard Shell

### Layout (`app/(dashboard)/layout.tsx`)
- Left: `<Sidebar>` (navy, fixed, 240px)
- Top: `<TopBar>` (white, shadow)
- Main: `{children}` with `#F9FAFB` background

### Components
- `components/dashboard/Sidebar.tsx` — 11 nav items. Active = pink left border + pink text. Clerk `<UserButton>` + Logout at bottom
- `components/dashboard/TopBar.tsx` — Page title, credit balance chip, notification bell, user avatar

### Dashboard Home (`app/(dashboard)/dashboard/page.tsx`)
- Stats row: Total Tickets | Open | Resolved Today | Credits Remaining (CreditMeter)
- 2×4 quick action cards grid
- Recent activity feed (last 10 ticket events)

### Shared Components
- `components/shared/LoadingSpinner.tsx`
- `components/shared/LoadingSkeleton.tsx`
- `components/shared/EmptyState.tsx`
- `components/shared/ErrorBoundary.tsx`
- `components/shared/RoleGuard.tsx`
- `components/shared/StatusBadge.tsx`
- `components/shared/PriorityBadge.tsx`
- `components/shared/ConfirmDialog.tsx`

### Dashboard-specific shared
- `components/dashboard/StatsCard.tsx`
- `components/dashboard/CreditMeter.tsx`

---

## Phase 5 — Core Dashboard Pages

### Tickets
- `app/(dashboard)/tickets/page.tsx` — Filter tabs + search + table with all columns. Bulk actions.
- `app/(dashboard)/tickets/[id]/page.tsx` — 60/40 split: chat history (left) + metadata panel (right)
- `components/dashboard/TicketTable.tsx`
- `components/dashboard/TicketCard.tsx`
- `components/dashboard/TicketFilters.tsx`
- `components/dashboard/TicketDetail.tsx`

### Knowledge Base
- `app/(dashboard)/knowledge/page.tsx` — Split layout: upload area + processing queue + data sources. Table below.
- `components/dashboard/KnowledgeUpload.tsx` — Drag-drop, file type icons, progress bars
- `components/dashboard/KnowledgeDocList.tsx` — Table with embedding status badges

### Agents
- `app/(dashboard)/agents/page.tsx` — Agent cards grid. Auto-assign toggle. Add Agent button.
- `components/dashboard/AgentCard.tsx`
- `components/dashboard/AgentStatusBadge.tsx`

### Custom Hooks (for these pages)
- `hooks/useTickets.ts` — TanStack Query, fetches tickets with filters, company_id scoped
- `hooks/useTicket.ts` — Single ticket detail
- `hooks/useAgents.ts` — Agent list with status
- `hooks/useKnowledge.ts` — Knowledge documents list
- `hooks/useCredits.ts` — Credit balance from Postgres

### API Routes (for this phase)
- `app/api/chat/route.ts`
- `app/api/ticket/route/route.ts`
- `app/api/ticket/escalate/route.ts`
- `app/api/knowledge/upload/route.ts`
- `app/api/knowledge/search/route.ts`

---

## Phase 6 — Agent Console

### Layout (`app/(agent)/layout.tsx`)
- Compact high-density layout, dark mode preferred

### Pages
- `app/(agent)/agent/page.tsx` — Agent landing (redirects to queue)
- `app/(agent)/agent/queue/page.tsx` — Status toggle + queue stats + ticket list with Claim buttons
- `app/(agent)/agent/chat/[ticketId]/page.tsx` — 60/40 split chat view

### Components
- `components/agent/AgentStatusToggle.tsx` — Online/Away/Offline toggle → updates DB
- `components/agent/QueueItem.tsx` — Ticket card in queue list
- `components/agent/ChatWindow.tsx` — Message history with Framer Motion entrance
- `components/agent/MessageBubble.tsx` — Customer (navy) / AI (grey) / Agent (pink) bubbles
- `components/agent/ChatInput.tsx` — Textarea + Send + Call Customer button
- `components/agent/SuggestionPanel.tsx` — 3 AI suggestion cards (click to insert)
- `components/agent/CustomerInfoPanel.tsx` — Name, email, phone, ticket history
- `components/agent/TicketActionsBar.tsx` — Resolve | Escalate | Transfer | Add Note

### Custom Hooks
- `hooks/useAgentQueue.ts` — Real-time queue with refetch interval
- `hooks/useAgentStatus.ts` — Agent online/away/offline toggle
- `hooks/useSession.ts` — Current agent session info

### API Routes
- `app/api/suggest/route.ts`
- `app/api/vapi/assistant/route.ts`
- `app/api/vapi/outbound/route.ts`

---

## Phase 7 — Customer Widget

### Page
- `app/widget/page.tsx` — No auth. `?company_id=xxx`. Loads company colors from DB.

### Components
- `components/widget/WidgetLauncher.tsx` — Floating button, pulse animation
- `components/widget/WidgetContainer.tsx` — 380px container, 5 state views
- `components/widget/WidgetHeader.tsx` — Logo + name + action buttons
- `components/widget/MessageList.tsx` — Scrollable message history
- `components/widget/MessageBubble.tsx` — Customer right / AI left + action row
- `components/widget/WidgetInput.tsx` — Textarea + Send + Attachment
- `components/widget/AiResponseActions.tsx` — 👍 / 👎 / Create Ticket / Talk to Human
- `components/widget/HumanHandoff.tsx` — "Connecting..." spinner + queue position
- `components/widget/TicketView.tsx` — Ticket status + action buttons
- `components/widget/NotificationsArea.tsx` — Status updates list

### State
- Zustand store (no localStorage) — session_id, messages, widgetState, ticketId
- `hooks/useWidget.ts` — widget open/close, send message, session management

### Embed Script
- `public/embed.js` — iframe injector, exact code from CLAUDE.md §14

---

## Phase 8 — Remaining Dashboard Pages

| Page | Key Components Needed |
|---|---|
| `analytics/page.tsx` | Date range picker + 6 Recharts charts (UsageChart reused) |
| `billing/page.tsx` | Plan cards + CreditMeter + Top-up button + Paystack flow + tables |
| `settings/page.tsx` | 7 tabs: Company Profile, AI Personality, Notifications, Security, Human Agent Settings, Integrations, Danger Zone |
| `integrations/page.tsx` | Marketplace layout, category sidebar, 6 integration cards |
| `widget/page.tsx` | Color picker + preview iframe + embed code block |
| `users/page.tsx` | Users table with role dropdowns + invite link |
| `team-chat/page.tsx` | Channel list + chat window |

### Additional Components
- `components/dashboard/UsageChart.tsx` — Recharts line/bar/area/donut charts
- `components/dashboard/PricingTable.tsx` — Plan comparison cards
- `components/dashboard/WidgetPreview.tsx` — Live preview iframe
- `components/dashboard/EmbedCodeBlock.tsx` — Copyable snippet
- `components/dashboard/RoutingRulesForm.tsx` — Threshold + hours + mode form

### API Routes
- `app/api/credits/deduct/route.ts`
- `app/api/payment/initialize/route.ts`
- `app/api/payment/verify/route.ts`
- `app/api/payment/webhook/route.ts`
- `app/api/webhooks/clerk/route.ts`
- `app/api/webhooks/whatsapp/route.ts`

---

## Phase 9 — Super Admin

### Pages
- `app/(super-admin)/super-admin/page.tsx` — Platform health dashboard
- `app/(super-admin)/super-admin/organizations/page.tsx` — All companies table
- `app/(super-admin)/super-admin/credits/page.tsx` — Credit ledger
- `app/(super-admin)/super-admin/system/page.tsx` — System config + logs

### Guard
- All super-admin routes check `user.role === 'super_admin'` via `requireRole()`

---

## Phase 10 — Tests

### Unit Tests
- `tests/unit/lib/n8n.test.ts`
- `tests/unit/lib/paystack.test.ts`
- `tests/unit/lib/r2.test.ts`
- `tests/unit/lib/auth.test.ts`
- `tests/unit/components/StatusBadge.test.tsx`
- `tests/unit/components/CreditMeter.test.tsx`
- `tests/unit/components/TicketCard.test.tsx`
- `tests/unit/components/MessageBubble.test.tsx`

### Integration Tests
- `tests/integration/api/chat.test.ts`
- `tests/integration/api/ticket-route.test.ts`
- `tests/integration/api/ticket-escalate.test.ts`
- `tests/integration/api/knowledge-upload.test.ts`
- `tests/integration/api/payment-initialize.test.ts`
- `tests/integration/api/payment-verify.test.ts`
- `tests/integration/api/payment-webhook.test.ts`

### E2E Tests
- 10 Playwright spec files as specified in CLAUDE.md §15

---

## Key Architectural Decisions

### Data Fetching Strategy
- **Postgres directly via Drizzle** for: tickets, customers, agents, credits, companies, knowledge docs
- **Via n8n (`callN8n()`)** for: AI chat, routing, escalation, KB ingestion, suggestions, credit deduction
- **TanStack Query** for all async data — never `useEffect`
- **Zustand** for widget in-memory state only (no localStorage)

### Multi-tenancy Rule
Every single Drizzle query MUST include `.where(eq(table.company_id, companyId))` filter. No exceptions.

### Security Rules
- No `NEXT_PUBLIC_` on secrets (n8n URL/secret, Paystack secret, DB URL)
- Clerk `auth()` check on every non-public API route
- Zod validation on every API route body
- No inline styles — Tailwind only
- No `any` TypeScript

### Font Strategy
- Headings: Clash Display (Fontshare CDN)
- Body: DM Sans (Google Fonts)
- NEVER: Inter, Roboto, Arial, system fonts

---

## Execution Order for First Session

1. **Run scaffold command** (manual step — needs user to run in terminal)
2. **Install all dependencies**
3. **Create all config files** (tailwind, next, drizzle, vitest, playwright)
4. **Create globals.css** with all CSS vars + font imports
5. **Create all lib/ files** (9 files — db, schema, n8n, r2, paystack, auth, types, constants, utils)
6. **Create middleware.ts**
7. **Create root app/layout.tsx**
8. **Create .env.local** (empty placeholders)
9. **Run drizzle-kit push**

---

*Plan ready. Awaiting approval to begin Phase 1.*