import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Browser-side Supabase client — used only for Realtime subscriptions.
 * Read/write operations go through API routes (server-side, service role key).
 * Requires NEXT_PUBLIC_SUPABASE_ANON_KEY to be set.
 */
export const supabaseBrowser = createClient(url, anonKey, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
})

export const realtimeEnabled = Boolean(anonKey)
