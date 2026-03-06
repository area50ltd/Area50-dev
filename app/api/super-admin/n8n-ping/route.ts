import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const rawUrl = searchParams.get('url')
  if (!rawUrl) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  // Only allow pinging known-safe hosts (n8n self-hosted)
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 })
  }

  try {
    const res = await fetch(`${url.origin}/health`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    return NextResponse.json({ ok: res.ok, status: res.status })
  } catch {
    return NextResponse.json({ ok: false, status: 0 }, { status: 200 })
  }
}
