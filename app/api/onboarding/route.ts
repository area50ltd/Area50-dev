import { createClient } from '@/lib/supabase/server'
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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = user.id

  const body = await req.json()
  const parsed = OnboardingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const {
    companyName, supportEmail, language, timezone, aiPersonality,
    widgetColor, welcomeMessage, widgetAvatar,
    complexityThreshold, keywordsEscalate, businessHoursStart, businessHoursEnd,
    afterHoursMode, afterHoursMessage, afterHoursAgentAvailable, maxAiAttempts,
  } = parsed.data

  try {
    // If user already has a company, return it without re-creating
    const [existingUser] = await db.select().from(users).where(eq(users.clerk_id, userId)).limit(1)
    if (existingUser?.company_id) {
      return NextResponse.json({ company_id: existingUser.company_id })
    }

    // Check if a company with this support email already exists (from a previous partial setup)
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.email, supportEmail))
      .limit(1)

    let company = existingCompany ?? null

    if (!company) {
      // 1. Create the company
      const inserted = await db
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
      company = inserted[0] ?? null
    }

    if (!company) throw new Error('Failed to create company')

    // 2. Save company_id on the user row.
    //    Strategy: UPDATE by clerk_id first (covers most cases).
    //    If nothing was updated (user row doesn't exist yet), INSERT fresh.
    //    onConflictDoUpdate handles any race condition.
    const userName = (user.user_metadata?.full_name as string | undefined)
      ?? (user.user_metadata?.name as string | undefined)
      ?? null
    const userEmail = user.email ?? ''

    const updated = await db
      .update(users)
      .set({ company_id: company.id, role: 'admin' })
      .where(eq(users.clerk_id, userId))
      .returning({ id: users.id })

    if (updated.length === 0) {
      // No row exists for this clerk_id yet — insert it.
      // onConflictDoUpdate on clerk_id handles any write race.
      await db
        .insert(users)
        .values({
          clerk_id: userId,
          email: userEmail,
          name: userName,
          role: 'admin',
          company_id: company.id,
        })
        .onConflictDoUpdate({
          target: users.clerk_id,
          set: { company_id: company.id, role: 'admin' },
        })
    }

    // 3. Create routing rules (skip if already exist for this company)
    const [existingRules] = await db
      .select()
      .from(routing_rules)
      .where(eq(routing_rules.company_id, company.id))
      .limit(1)
    if (!existingRules) {
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
    }

    // 4. Auto-create Vapi assistant (non-blocking)
    callN8n('/webhook/vapi/assistant/get', { company_id: company.id, force_rebuild: false }).catch(() => {})

    return NextResponse.json({ company_id: company.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/onboarding]', message, err)
    return NextResponse.json(
      { error: `Setup failed: ${message}` },
      { status: 500 }
    )
  }
}
