import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { knowledge_documents } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const docs = await db
    .select()
    .from(knowledge_documents)
    .where(eq(knowledge_documents.company_id, currentUser.company_id))
    .orderBy(desc(knowledge_documents.created_at))

  return NextResponse.json(docs)
}
