import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { uploadFile } from '@/lib/r2'
import { db } from '@/lib/db'
import { companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WebP, or GIF images are allowed' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `avatar.${file.type.split('/')[1]}`

  const { url } = await uploadFile(user.company_id, buffer, filename, file.type)

  // Update the company's widget_avatar field
  await db
    .update(companies)
    .set({ widget_avatar: url, updated_at: new Date() })
    .where(eq(companies.id, user.company_id))

  return NextResponse.json({ url })
}
