import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies, users, routing_rules } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { callN8n } from '@/lib/n8n'

const OnboardingSchema = z.object({
  // Company fields
  companyName: z.string().min(2),
  supportEmail: z.string().email(),
  language: z.string().max(10).default('en'),
  timezone: z.string().max(50).default('Africa/Lagos'),
  aiPersonality: z.string().optional(),
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1B2A4A'),
  welcomeMessage: z.string().default('Hello! How can I help you today?'),
  widgetAvatar: z.string().url().optional().nullable(),

  // Routing rule fields
  complexityThreshold: z.number().int().min(1).max(10).default(6),
  keywordsEscalate: z.array(z.string()).default(['refund', 'legal', 'lawsuit', 'fraud', 'cancel']),
  businessHoursStart: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
  businessHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).default('18:00'),
  afterHoursMode: z.enum(['ai_only', 'voicemail', 'offline']).default('ai_only'),
  afterHoursMessage: z.string().optional().nullable(),
  afterHoursAgentAvailable: z.boolean().default(false),
  maxAiAttempts: z.number().int().min(1).max(10).default(3),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = OnboardingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const {
    companyName, supportEmail, language, timezone, aiPersonality,
    widgetColor, welcomeMessage, widgetAvatar,
    complexityThreshold, keywordsEscalate, businessHoursStart, businessHoursEnd,
    afterHoursMode, afterHoursMessage, afterHoursAgentAvailable, maxAiAttempts,
  } = parsed.data

  // If user already has a company, return it without re-creating
  const existing = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (existing?.company_id) {
    return NextResponse.json({ company_id: existing.company_id })
  }

  // 1. Create the company
  const [company] = await db
    .insert(companies)
    .values({
      name: companyName,
      email: supportEmail,
      plan: 'starter',
      credits: 5000,
      language,
      ai_personality: aiPersonality ?? null,
      widget_color: widgetColor,
      widget_welcome: welcomeMessage,
      widget_avatar: widgetAvatar ?? null,
    })
    .returning()

  // 2. Link user to company
  await db
    .insert(users)
    .values({
      clerk_id: userId,
      email: supportEmail,
      name: existing?.name ?? null,
      role: 'admin',
      company_id: company.id,
    })
    .onConflictDoUpdate({
      target: users.clerk_id,
      set: { company_id: company.id },
    })

  // 3. Create routing rules with all collected settings
  await db.insert(routing_rules).values({
    company_id: company.id,
    complexity_threshold: complexityThreshold,
    keywords_escalate: keywordsEscalate,
    business_hours_start: businessHoursStart,
    business_hours_end: businessHoursEnd,
    timezone,
    after_hours_mode: afterHoursMode,
    after_hours_message: afterHoursMessage ?? null,
    after_hours_agent_available: afterHoursAgentAvailable,
    max_ai_attempts: maxAiAttempts,
  })

  // 4. Auto-create Vapi assistant (non-blocking — don't fail onboarding if WF7 is down)
  try {
    await callN8n('/webhook/vapi/assistant/get', { company_id: company.id, force_rebuild: false })
  } catch {
    // Non-fatal — Vapi assistant can be created later from Integrations page
  }

  return NextResponse.json({ company_id: company.id })
}
