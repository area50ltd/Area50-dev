import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies, users, routing_rules } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const OnboardingSchema = z.object({
  companyName: z.string().min(2),
  supportEmail: z.string().email(),
  plan: z.enum(['starter', 'growth', 'business']).default('growth'),
  aiPersonality: z.string().optional(),
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1B2A4A'),
  welcomeMessage: z.string().default('Hello! How can I help you today?'),
})

const PLAN_CREDITS: Record<string, number> = {
  starter: 5000,
  growth: 15000,
  business: 40000,
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = OnboardingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { companyName, supportEmail, plan, aiPersonality, widgetColor, welcomeMessage } = parsed.data

  // If user already has a company, skip creation
  const existing = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (existing?.company_id) {
    return NextResponse.json({ company_id: existing.company_id })
  }

  // Create the company
  const [company] = await db
    .insert(companies)
    .values({
      name: companyName,
      email: supportEmail,
      plan,
      credits: PLAN_CREDITS[plan] ?? 5000,
      ai_personality: aiPersonality ?? null,
      widget_color: widgetColor,
      widget_welcome: welcomeMessage,
    })
    .returning()

  // Link the user to the company (upsert — handles both webhook-created and auto-created users)
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

  // Create default routing rules for the company
  await db.insert(routing_rules).values({ company_id: company.id })

  return NextResponse.json({ company_id: company.id })
}
