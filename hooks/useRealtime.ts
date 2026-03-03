'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabaseBrowser, realtimeEnabled } from '@/lib/supabase-browser'

/**
 * Subscribes to new messages on a ticket via Supabase Realtime.
 * Instantly invalidates the ticket query when a new message arrives —
 * no waiting for the 30s polling interval.
 *
 * Falls back gracefully if NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.
 */
export function useRealtimeMessages(ticketId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!realtimeEnabled || !ticketId) return

    const channel = supabaseBrowser
      .channel(`messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
        }
      )
      .subscribe()

    return () => {
      supabaseBrowser.removeChannel(channel)
    }
  }, [ticketId, queryClient])
}

/**
 * Subscribes to ticket INSERT and UPDATE events via Supabase Realtime.
 * Instantly refreshes the agent queue when a ticket is escalated —
 * no waiting for the 15s polling interval.
 *
 * Falls back gracefully if NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.
 */
export function useRealtimeQueue(companyId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!realtimeEnabled) return

    const filter = companyId
      ? `company_id=eq.${companyId}`
      : undefined

    const channel = supabaseBrowser
      .channel('agent-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',           // INSERT + UPDATE
          schema: 'public',
          table: 'tickets',
          ...(filter ? { filter } : {}),
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['agent-queue'] })
          queryClient.invalidateQueries({ queryKey: ['tickets'] })
        }
      )
      .subscribe()

    return () => {
      supabaseBrowser.removeChannel(channel)
    }
  }, [companyId, queryClient])
}
