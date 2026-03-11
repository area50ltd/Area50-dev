'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsLoaded(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const meta = user?.user_metadata
  return {
    isLoaded,
    userId: user?.id,
    name: (meta?.full_name as string | undefined) ?? (meta?.name as string | undefined) ?? 'Agent',
    email: user?.email,
    avatarUrl: (meta?.avatar_url as string | undefined) ?? null,
  }
}
