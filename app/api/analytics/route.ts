import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tickets, messages } from '@/lib/schema'
import { eq, and, gte, sql, count } from 'drizzle-orm'
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

  // Messages per day (AI vs Human)
  const msgPerDay = await db
    .select({
      date: sql<string>`DATE(${messages.created_at})`.as('date'),
      sender_type: messages.sender_type,
      count: count(),
    })
    .from(messages)
    .where(and(eq(messages.company_id, companyId), gte(messages.created_at, since)))
    .groupBy(sql`DATE(${messages.created_at})`, messages.sender_type)
    .orderBy(sql`DATE(${messages.created_at})`)

  // Channel breakdown
  const channelBreakdown = await db
    .select({
      channel: tickets.channel,
      count: count(),
    })
    .from(tickets)
    .where(and(eq(tickets.company_id, companyId), gte(tickets.created_at, since)))
    .groupBy(tickets.channel)

  // AI vs Human resolution
  const resolutionBreakdown = await db
    .select({
      assigned_to: tickets.assigned_to,
      count: count(),
    })
    .from(tickets)
    .where(and(
      eq(tickets.company_id, companyId),
      eq(tickets.is_resolved, true),
      gte(tickets.created_at, since)
    ))
    .groupBy(tickets.assigned_to)

  // Tickets per day (for resolution rate chart)
  const ticketsPerDay = await db
    .select({
      date: sql<string>`DATE(${tickets.created_at})`.as('date'),
      total: count(),
      resolved: sql<number>`COUNT(CASE WHEN ${tickets.is_resolved} = true THEN 1 END)`.as('resolved'),
    })
    .from(tickets)
    .where(and(eq(tickets.company_id, companyId), gte(tickets.created_at, since)))
    .groupBy(sql`DATE(${tickets.created_at})`)
    .orderBy(sql`DATE(${tickets.created_at})`)

  // Aggregate messages by day into a map
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
  }))

  const channelData = channelBreakdown.map((r) => ({
    channel: r.channel === 'web_widget' ? 'Web Chat' : r.channel === 'whatsapp' ? 'WhatsApp' : r.channel === 'voice_inbound' ? 'Voice' : r.channel ?? 'Unknown',
    tickets: r.count,
  }))

  const aiResolved = resolutionBreakdown.find((r) => r.assigned_to === 'ai')?.count ?? 0
  const humanResolved = resolutionBreakdown.find((r) => r.assigned_to !== 'ai')?.count ?? 0
  const totalResolved = aiResolved + humanResolved

  const pieData = [
    { name: 'AI Resolved', value: totalResolved > 0 ? Math.round((aiResolved / totalResolved) * 100) : 0, color: '#E91E8C' },
    { name: 'Human Resolved', value: totalResolved > 0 ? Math.round((humanResolved / totalResolved) * 100) : 0, color: '#1B2A4A' },
  ]

  const resolutionData = ticketsPerDay.map((r) => ({
    day: new Date(r.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    rate: r.total > 0 ? Math.round((Number(r.resolved) / r.total) * 100) : 0,
  }))

  return NextResponse.json({
    messagesOverTime,
    channelData,
    pieData,
    resolutionData,
  })
}
