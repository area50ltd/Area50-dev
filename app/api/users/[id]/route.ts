import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const PatchSchema = z.object({
  role: z.enum(['admin', 'agent', 'customer', 'maintenance']).optional(),
  is_active: z.boolean().optional(),
})

// PATCH /api/users/[id] — update role or is_active (suspend/reactivate)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await getCurrentUser()
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })
  if (!['admin', 'super_admin'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    // Verify target user belongs to same company
    const target = await db.query.users.findFirst({
      where: and(eq(users.id, params.id), eq(users.company_id, currentUser.company_id)),
    })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Prevent demoting the only admin
    if (parsed.data.role && parsed.data.role !== 'admin' && target.role === 'admin') {
      const adminCount = await db.query.users.findMany({
        where: and(eq(users.company_id, currentUser.company_id), eq(users.role, 'admin')),
      })
      if (adminCount.length <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 })
      }
    }

    await db.update(users).set(parsed.data).where(eq(users.id, params.id))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/users PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// DELETE /api/users/[id] — remove user from the company
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await getCurrentUser()
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })
  if (!['admin', 'super_admin'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent self-deletion
  if (params.id === currentUser.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  try {
    // Verify target belongs to same company
    const target = await db.query.users.findFirst({
      where: and(eq(users.id, params.id), eq(users.company_id, currentUser.company_id)),
    })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await db.delete(users).where(eq(users.id, params.id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/users DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
