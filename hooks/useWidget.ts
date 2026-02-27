import { create } from 'zustand'
import { generateSessionId } from '@/lib/utils'
import type { Message } from '@/lib/types'

type WidgetView = 'chat' | 'handoff' | 'ticket' | 'notifications'

interface WidgetState {
  isOpen: boolean
  view: WidgetView
  sessionId: string
  ticketId: string | null
  messages: Message[]
  isSending: boolean
  queuePosition: number | null

  open: () => void
  close: () => void
  setView: (view: WidgetView) => void
  addMessage: (message: Omit<Message, 'id' | 'created_at'>) => void
  setTicketId: (id: string) => void
  setSending: (v: boolean) => void
  setQueuePosition: (pos: number | null) => void
}

export const useWidget = create<WidgetState>((set) => ({
  isOpen: false,
  view: 'chat',
  sessionId: generateSessionId(),
  ticketId: null,
  messages: [],
  isSending: false,
  queuePosition: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).slice(2),
          created_at: new Date(),
        },
      ],
    })),
  setTicketId: (id) => set({ ticketId: id }),
  setSending: (isSending) => set({ isSending }),
  setQueuePosition: (queuePosition) => set({ queuePosition }),
}))
