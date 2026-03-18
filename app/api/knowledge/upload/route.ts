import { NextResponse } from 'next/server'
import { eq, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { knowledge_documents, companies, plans } from '@/lib/schema'
import { uploadFile, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/r2'
import { callN8n } from '@/lib/n8n'
import { getCurrentUser } from '@/lib/auth'
import { deductCredits } from '@/lib/credits'
import { limitsFromDbRow, getPlanLimits, withinLimit } from '@/lib/plan-limits'

export async function POST(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  // ── Plan limit: max_kb_docs ────────────────────────────────────────────────
  const [company, kbCountResult] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, currentUser.company_id) }),
    db.select({ count: count() }).from(knowledge_documents).where(eq(knowledge_documents.company_id, currentUser.company_id)),
  ])
  const planRow = company?.plan
    ? await db.query.plans.findFirst({ where: eq(plans.key, company.plan) })
    : null
  const limits = planRow ? limitsFromDbRow({ ...planRow }) : getPlanLimits(company?.plan ?? 'starter')
  const kbCount = kbCountResult[0]?.count ?? 0
  if (!withinLimit(kbCount, limits.max_kb_docs)) {
    return NextResponse.json(
      { error: 'Knowledge base document limit reached for your plan.', upgrade_required: true, required_plan: 'growth' },
      { status: 403 },
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    const contentType = file.type
    const fileExt = ALLOWED_FILE_TYPES[contentType]
    if (!fileExt) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { key, documentId, url } = await uploadFile(
      currentUser.company_id,
      buffer,
      file.name,
      contentType
    )

    // Save to DB as processing
    await db.insert(knowledge_documents).values({
      id: documentId,
      company_id: currentUser.company_id,
      filename: file.name,
      file_type: fileExt,
      file_size: file.size,
      r2_key: key,
      r2_url: url,
      embedding_status: 'processing',
    })

    // Await n8n synchronously — background void tasks are killed by Vercel
    // after the response is sent. Embedding takes 10-30s; Vercel Pro allows 60s.
    try {
      await callN8n('/webhook/knowledge/ingest', {
        company_id: currentUser.company_id,
        document_id: documentId,
        file_url: url,
        file_type: fileExt,
        filename: file.name,
      })
      await db
        .update(knowledge_documents)
        .set({ embedding_status: 'completed' })
        .where(eq(knowledge_documents.id, documentId))
    } catch (err) {
      console.error('[knowledge/ingest]', err)
      await db
        .update(knowledge_documents)
        .set({ embedding_status: 'error' })
        .where(eq(knowledge_documents.id, documentId))
    }

    // Deduct 5 credits per KB document embed (fire-and-forget)
    void deductCredits({
      company_id: currentUser.company_id,
      type: 'kb_embed',
      amount: 5,
      reference: documentId,
    })

    return NextResponse.json({ success: true, documentId, url })
  } catch (err) {
    console.error('[api/knowledge/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
