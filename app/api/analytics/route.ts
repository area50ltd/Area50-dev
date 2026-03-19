import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tickets, messages } from '@/lib/schema'
import { eq, and, gte, sql, count, sum } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

function daysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const rangeDays = parseInt(searchParams.get('days') ?? '30')
  const since = daysAgo(rangeDays)
  const companyId = currentUser.company_id

  // ── Parallel queries ──────────────────────────────────────
  const [
    msgPerDay,
    channelBreakdown,
    resolutionBreakdown,
    ticketsPerDay,
    totalMessagesResult,
    totalTicketsResult,
    sentimentBreakdown,
    statusBreakdown,
  ] = await Promise.all([
    // Messages per day (AI vs Human)
    db
      .select({
        date: sql<string>`DATE(${messages.created_at})`.as('date'),
        sender_type: messages.sender_type,
        count: count(),
      })
      .from(messages)
      .where(and(eq(messages.company_id, companyId), gte(messages.created_at, since)))
      .groupBy(sql`DATE(${messages.created_at})`, messages.sender_type)
      .orderBy(sql`DATE(${messages.created_at})`),

    // Channel breakdown
    db
      .select({ channel: tickets.channel, count: count() })
      .from(tickets)
      .where(and(eq(tickets.company_id, companyId), gte(tickets.created_at, since)))
      .groupBy(tickets.channel),

    // AI vs Human resolution
    db
      .select({ assigned_to: tickets.assigned_to, count: count() })
      .from(tickets)
      .where(and(
        eq(tickets.company_id, companyId),
        eq(tickets.is_resolved, true),
        gte(tickets.created_at, since)
      ))
      .groupBy(tickets.assigned_to),

    // Tickets per day (for resolution rate)
    db
      .select({
        date: sql<string>`DATE(${tickets.created_at})`.as('date'),
        total: count(),
        resolved: sql<number>`COUNT(CASE WHEN ${tickets.is_resolved} = true THEN 1 END)`.as('resolved'),
      })
      .from(tickets)
      .where(and(eq(tickets.company_id, companyId), gte(tickets.created_at, since)))
      .groupBy(sql`DATE(${tickets.created_at})`)
      .orderBy(sql`DATE(${tickets.created_at})`),

    // Total messages
    db
      .select({ total: count() })
      .from(messages)
      .where(and(eq(messages.company_id, companyId), gte(messages.created_at, since))),

    // Total tickets + resolved count
    db
      .select({
        total: count(),
        resolved: sql<number>`COUNT(CASE WHEN ${tickets.is_resolved} = true THEN 1 END)`.as('resolved'),
      })
      .from(tickets)
      .where(and(eq(tickets.company_id, companyId), gte(tickets.created_at, since))),

    // Sentiment breakdown
    db
      .select({ sentiment: tickets.sentiment, count: count() })
      .from(tickets)
      .where(and(
        eq(tickets.company_id, companyId),
        gte(tickets.created_at, since),
        sql`${tickets.sentiment} IS NOT NULL`
      ))
      .groupBy(tickets.sentiment),

    // Status breakdown
    db
      .select({ status: tickets.status, count: count() })
      .from(tickets)
      .where(and(eq(tickets.company_id, companyId), gte(tickets.created_at, since)))
      .groupBy(tickets.status),
  ])

  // ── Transform ──────────────────────────────────────────────
  const msgMap: Record<string, { ai: number; human: number }> = {}
  for (const row of msgPerDay) {
    if (!msgMap[row.date]) msgMap[row.date] = { ai: 0, human: 0 }
    if (row.sender_type === 'ai') msgMap[row.date].ai = row.count
    if (row.sender_type === 'agent') msgMap[row.date].human = row.count
  }

  const messagesOverTime = Object.entries(msgMap).map(([date, counts]) => ({
    date: new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    ai: counts.ai,
    human: counts.human,
    total: counts.ai + counts.human,
  }))

  const channelData = channelBreakdown.map((r) => ({
    channel:
      r.channel === 'web_widget' ? 'Web Chat'
      : r.channel === 'whatsapp' ? 'WhatsApp'
      : r.channel === 'voice_inbound' ? 'Voice'
      : r.channel ?? 'Unknown',
    tickets: r.count,
  }))

  const aiResolved = resolutionBreakdown.find((r) => r.assigned_to === 'ai')?.count ?? 0
  const humanResolved = resolutionBreakdown.find((r) => r.assigned_to !== 'ai')?.count ?? 0
  const totalResolved = aiResolved + humanResolved

  const pieData = [
    { name: 'AI', value: totalResolved > 0 ? Math.round((aiResolved / totalResolved) * 100) : 0, color: '#7c3aed' },
    { name: 'Human', value: totalResolved > 0 ? Math.round((humanResolved / totalResolved) * 100) : 0, color: '#111827' },
  ]

  const resolutionData = ticketsPerDay.map((r) => ({
    day: new Date(r.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    rate: r.total > 0 ? Math.round((Number(r.resolved) / r.total) * 100) : 0,
    total: r.total,
    resolved: Number(r.resolved),
  }))

  const totalMessages = totalMessagesResult[0]?.total ?? 0
  const totalTickets = totalTicketsResult[0]?.total ?? 0
  const resolvedTickets = Number(totalTicketsResult[0]?.resolved ?? 0)
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0

  let aiMessages = 0
  let humanMessages = 0
  for (const row of msgPerDay) {
    if (row.sender_type === 'ai') aiMessages += row.count
    if (row.sender_type === 'agent') humanMessages += row.count
  }

  const SENTIMENT_COLORS: Record<string, string> = {
    positive: '#10b981',
    neutral: '#6b7280',
    negative: '#f59e0b',
    angry: '#ef4444',
  }

  const sentimentData = sentimentBreakdown.map((r) => ({
    name: r.sentiment ? r.sentiment.charAt(0).toUpperCase() + r.sentiment.slice(1) : 'Unknown',
    value: r.count,
    color: SENTIMENT_COLORS[r.sentiment ?? ''] ?? '#9ca3af',
  }))

  const STATUS_COLORS: Record<string, string> = {
    open: '#3b82f6',
    in_progress: '#f59e0b',
    escalated: '#ef4444',
    resolved: '#10b981',
    closed: '#6b7280',
  }

  const statusData = statusBreakdown.map((r) => ({
    name: r.status ? r.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown',
    value: r.count,
    color: STATUS_COLORS[r.status ?? ''] ?? '#9ca3af',
  }))

  return NextResponse.json({
    summary: {
      totalMessages,
      totalTickets,
      resolvedTickets,
      resolutionRate,
      aiMessages,
      humanMessages,
    },
    messagesOverTime,
    channelData,
    pieData,
    resolutionData,
    sentimentData,
    statusData,
  })
}
