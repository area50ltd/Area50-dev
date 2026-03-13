/**
 * Public widget chat endpoint — NO Clerk auth required.
 * Widget customers are not signed into Clerk; they authenticate
 * implicitly via a valid company_id.
 *
 * This route owns all persistence:
 *   1. Upsert the ticket (first message creates it)
 *   2. Save customer message
 *   3. Call n8n for AI response
 *   4. Save AI response
 *   5. Update ticket metadata from n8n (category, sentiment, escalation)
 */
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { callN8n } from '@/lib/n8n'
import { db } from '@/lib/db'
import { companies, tickets, messages } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { ChatResponse } from '@/lib/types'

const Schema = z.object({
  company_id: z.string().uuid(),
  message: z.string().min(1).max(5000),
  session_id: z.string().min(1),
  ticket_id: z.string().uuid(),
  channel: z.enum(['web_widget', 'whatsapp', 'voice_inbound']),
  language: z.string().default('en'),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { company_id, message, session_id, ticket_id, channel, language } = parsed.data

  // Validate the company exists and is active (prevents abuse of endpoint)
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, company_id),
  })
  if (!company || !company.is_active) {
    return NextResponse.json({ error: 'Invalid company' }, { status: 404 })
  }

  // 1. Ensure ticket exists — create on first message, ignore on subsequent ones
  await db.insert(tickets).values({
    id: ticket_id,
    company_id,
    channel,
    status: 'open',
    assigned_to: 'ai',
    session_id,
    language,
  }).onConflictDoNothing()

  // 2. Persist the customer message
  await db.insert(messages).values({
    ticket_id,
    company_id,
    sender_type: 'customer',
    sender_id: null,
    content: message,
  })

  // 3. Call n8n for AI response (25s timeout — keeps us within Vercel's serverless limit)
  let result: ChatResponse
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('n8n timeout')), 25_000),
    )
    const raw = await Promise.race([
      callN8n<unknown>('/webhook/ai/chat', parsed.data),
      timeoutPromise,
    ])
    // n8n sometimes wraps the response in an array — normalise it
    result = (Array.isArray(raw) ? raw[0] : raw) as ChatResponse
  } catch (err) {
    console.error('[api/widget/chat] n8n error:', err)
    const isTimeout = err instanceof Error && err.message === 'n8n timeout'
    return NextResponse.json(
      { error: isTimeout ? 'AI response timed out' : 'AI service unavailable' },
      { status: 503 },
    )
  }

  // Handle insufficient credits — WF13 tells us credits ran out
  if (result.insufficient) {
    return NextResponse.json({ error: 'Service temporarily unavailable. Please try again later.' }, { status: 402 })
  }

  // 4. Persist the AI response (if present)
  const r = result as unknown as Record<string, unknown>
  const responseText = (result.response || r.output || r.reply || r.message || r.text || r.answer) as string | undefined
  if (responseText) {
    await db.insert(messages).values({
      ticket_id,
      company_id,
      sender_type: 'ai',
      sender_id: null,
      content: String(responseText),
    })
  }

  // 5. Update ticket with enrichment from n8n (non-blocking — don't fail the request)
  try {
    const ticketUpdates: Record<string, unknown> = { updated_at: new Date() }
    if (result.category)   ticketUpdates.category = result.category
    if (result.sentiment)  ticketUpdates.sentiment = result.sentiment
    if (result.score != null) ticketUpdates.complexity_score = result.score
    if (result.escalate) {
      ticketUpdates.status = 'escalated'
      ticketUpdates.assigned_to = 'human'
    }
    await db.update(tickets).set(ticketUpdates).where(eq(tickets.id, ticket_id))
  } catch {
    // Non-fatal — enrichment is best-effort
  }

  // Always return `response` at the top level so the widget can reliably access it
  return NextResponse.json({ ...result, response: responseText ?? null })
}
