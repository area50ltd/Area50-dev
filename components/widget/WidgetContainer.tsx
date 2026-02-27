'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { WidgetHeader } from './WidgetHeader'
import { MessageBubble } from './MessageBubble'
import { WidgetInput } from './WidgetInput'
import { HumanHandoff } from './HumanHandoff'
import { useWidget } from '@/hooks/useWidget'
import type { Company } from '@/lib/types'

interface WidgetContainerProps {
  company: Company
}

export function WidgetContainer({ company }: WidgetContainerProps) {
  const {
    isOpen, view, messages, isSending, queuePosition,
    close, setView, addMessage, setSending, ticketId,
  } = useWidget()

  const widgetColor = company.widget_color ?? '#1B2A4A'

  const handleSend = async (content: string) => {
    // Optimistically add the message
    addMessage({
      ticket_id: ticketId,
      company_id: company.id,
      sender_type: 'customer',
      sender_id: null,
      content,
      is_helpful: null,
    })

    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          message: content,
          session_id: useWidget.getState().sessionId,
          ticket_id: ticketId ?? '00000000-0000-0000-0000-000000000000',
          channel: 'web_widget',
          language: 'en',
        }),
      })

      const data = await res.json()

      if (data.response) {
        addMessage({
          ticket_id: ticketId,
          company_id: company.id,
          sender_type: 'ai',
          sender_id: null,
          content: data.response,
          is_helpful: null,
        })
      }

      if (data.escalate) {
        setView('handoff')
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleTalkToHuman = () => {
    setView('handoff')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-24 right-5 z-[2147483646] w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100"
          style={{ height: '560px', display: 'flex', flexDirection: 'column' }}
        >
          <WidgetHeader
            companyName={company.name}
            avatarUrl={company.widget_avatar}
            color={widgetColor}
            onClose={close}
          />

          {/* Messages area */}
          {view === 'handoff' ? (
            <HumanHandoff
              queuePosition={queuePosition}
              onContinueWithAI={() => setView('chat')}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 scrollbar-thin">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl rounded-tl-sm p-3 text-sm text-neutral-700 shadow-sm border border-neutral-100 max-w-[85%]"
                  >
                    {company.widget_welcome ?? 'Hello! How can I help you today?'} 👋
                  </motion.div>
                )}

                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    widgetColor={widgetColor}
                    onTalkToHuman={handleTalkToHuman}
                    onCreateTicket={() => toast.info('Ticket created')}
                  />
                ))}

                {isSending && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-1" />
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-neutral-100">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <WidgetInput onSend={handleSend} isSending={isSending} />
            </>
          )}

          {/* Footer */}
          <div className="bg-white px-4 py-2 border-t border-neutral-50 text-center">
            <span className="text-[10px] text-neutral-300">Powered by</span>
            <span className="text-[10px] font-heading font-bold text-neutral-400 ml-1">Area50</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
