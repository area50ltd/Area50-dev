import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  // Verify the target user belongs to the same company
  const targetUser = await db.query.users.findFirst({
    where: and(eq(users.id, params.id), eq(users.company_id, currentUser.company_id)),
    columns: { clerk_id: true, email: true },
  })
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data, error } = await adminClient.auth.admin.getUserById(targetUser.clerk_id)
    if (error || !data.user) {
      return NextResponse.json({ last_sign_in_at: null })
    }
    return NextResponse.json({ last_sign_in_at: data.user.last_sign_in_at ?? null })
  } catch {
    return NextResponse.json({ last_sign_in_at: null })
  }
}
