'use client'

import { useState, useRef, useEffect } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Hash, Plus, Send, MoreHorizontal, UserPlus,
  Archive, Trash2, BellOff, Ticket, Sparkles,
  BookOpen, ChevronDown, Search,
} from 'lucide-react'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: string
  authorName: string
  authorId: string
  content: string
  timestamp: Date
}

interface Channel {
  id: string
  name: string
  description?: string
  unread: number
  messages: ChatMessage[]
}

const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'general',
    description: 'Company-wide announcements',
    unread: 0,
    messages: [
      { id: '1', authorName: 'Amara Okonkwo', authorId: 'amara', content: 'Good morning team! We have a busy day ahead.', timestamp: new Date(Date.now() - 3600000 * 2) },
      { id: '2', authorName: 'Chidi Eze', authorId: 'chidi', content: 'Morning! Ready for anything 💪', timestamp: new Date(Date.now() - 3600000) },
      { id: '3', authorName: 'Ngozi Adeyemi', authorId: 'ngozi', content: 'Heads up: we just got a surge of tickets from the Lagos campaign. All hands on deck!', timestamp: new Date(Date.now() - 1800000) },
    ],
  },
  {
    id: 'support-team',
    name: 'support-team',
    description: 'Agent coordination channel',
    unread: 3,
    messages: [
      { id: '4', authorName: 'Chidi Eze', authorId: 'chidi', content: 'The Paystack integration issue is being tracked in ticket #1234', timestamp: new Date(Date.now() - 7200000) },
      { id: '5', authorName: 'Ngozi Adeyemi', authorId: 'ngozi', content: "I'll take the next 3 escalations", timestamp: new Date(Date.now() - 3600000) },
      { id: '6', authorName: 'Chidi Eze', authorId: 'chidi', content: 'Thanks Ngozi. The customer has been waiting 8 minutes.', timestamp: new Date(Date.now() - 600000) },
    ],
  },
  {
    id: 'tech-issues',
    name: 'tech-issues',
    description: 'System alerts and technical problems',
    unread: 1,
    messages: [
      { id: '7', authorName: 'System', authorId: 'system', content: '⚠️ n8n webhook latency spiked to 3.2s. Monitoring...', timestamp: new Date(Date.now() - 900000) },
      { id: '8', authorName: 'Amara Okonkwo', authorId: 'amara', content: 'Investigating now. Likely the Supabase pooler. Will update in 10 mins.', timestamp: new Date(Date.now() - 300000) },
    ],
  },
]

const CURRENT_USER_ID = 'amara'
const CURRENT_USER_NAME = 'Amara Okonkwo'

interface MessageActionMenuProps {
  onForwardToTicket: () => void
  onAiSummarize: () => void
  onSaveToKB: () => void
  onClose: () => void
}

function MessageActionMenu({ onForwardToTicket, onAiSummarize, onSaveToKB, onClose }: MessageActionMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 -top-1 bg-white border border-neutral-100 shadow-lg rounded-xl py-1.5 z-10 min-w-[180px]"
    >
      <button className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2" onClick={onForwardToTicket}>
        <Ticket size={13} /> Forward to Ticket
      </button>
      <button className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2" onClick={onAiSummarize}>
        <Sparkles size={13} /> AI Summarize
      </button>
      <button className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2" onClick={onSaveToKB}>
        <BookOpen size={13} /> Save to Knowledge Base
      </button>
    </motion.div>
  )
}

export default function TeamChatPage() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS)
  const [activeId, setActiveId] = useState('general')
  const [input, setInput] = useState('')
  const [openMenuMsgId, setOpenMenuMsgId] = useState<string | null>(null)
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeChannel = channels.find((c) => c.id === activeId)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Clear unread on open
    setChannels((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c))
    )
  }, [activeId, activeChannel?.messages.length])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const msg: ChatMessage = {
      id: Date.now().toString(),
      authorName: CURRENT_USER_NAME,
      authorId: CURRENT_USER_ID,
      content: trimmed,
      timestamp: new Date(),
    }
    setChannels((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, msg] } : c))
    )
    setInput('')
  }

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return
    const slug = newChannelName.toLowerCase().replace(/\s+/g, '-')
    const newCh: Channel = {
      id: slug,
      name: slug,
      description: '',
      unread: 0,
      messages: [],
    }
    setChannels((prev) => [...prev, newCh])
    setActiveId(slug)
    setNewChannelName('')
    setShowCreateChannel(false)
    toast.success(`#${slug} created`)
  }

  const handleArchive = () => {
    toast.success(`#${activeChannel.name} archived`)
    setShowChannelMenu(false)
  }

  const handleDelete = () => {
    setChannels((prev) => prev.filter((c) => c.id !== activeId))
    setActiveId('general')
    toast.success(`Channel deleted`)
    setShowChannelMenu(false)
  }

  const filteredChannels = channels.filter((c) =>
    c.name.includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Team Chat" />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-[#1B2A4A] flex flex-col shrink-0">
          <div className="p-3">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                placeholder="Search channels"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 text-white text-xs rounded-lg pl-8 pr-3 py-2 placeholder:text-white/30 focus:outline-none focus:bg-white/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Channels</p>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
            {filteredChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveId(ch.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                  activeId === ch.id
                    ? 'bg-white/15 text-white font-medium border-l-2 border-[#E91E8C]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )}
              >
                <Hash size={14} className="shrink-0" />
                <span className="flex-1 text-left truncate">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="bg-[#E91E8C] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                    {ch.unread}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Channel header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Hash size={18} className="text-neutral-400" />
              <span className="font-medium text-[#1B2A4A]">{activeChannel.name}</span>
              {activeChannel.description && (
                <>
                  <span className="text-neutral-200">|</span>
                  <span className="text-sm text-neutral-400">{activeChannel.description}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500 hover:text-[#1B2A4A]" onClick={() => toast.info('Add member coming soon')}>
                <UserPlus size={15} />
                <span className="text-xs">Add Member</span>
              </Button>
              <div className="relative">
                <button
                  onClick={() => setShowChannelMenu(!showChannelMenu)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                >
                  <MoreHorizontal size={18} />
                </button>
                <AnimatePresence>
                  {showChannelMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-9 bg-white border border-neutral-100 shadow-lg rounded-xl py-1.5 z-10 min-w-[160px]"
                    >
                      <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5" onClick={() => { toast.info('Muted'); setShowChannelMenu(false) }}>
                        <BellOff size={14} /> Mute Channel
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5" onClick={handleArchive}>
                        <Archive size={14} /> Archive
                      </button>
                      <div className="h-px bg-neutral-100 my-1" />
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5" onClick={handleDelete}>
                        <Trash2 size={14} /> Delete Channel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <AnimatePresence initial={false}>
              {activeChannel.messages.map((msg) => {
                const isMine = msg.authorId === CURRENT_USER_ID
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 group"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                      isMine ? 'bg-[#E91E8C]' : 'bg-[#1B2A4A]'
                    )}>
                      {msg.authorId === 'system' ? '⚙' : getInitials(msg.authorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className={cn('text-sm font-semibold', isMine ? 'text-[#E91E8C]' : 'text-[#1B2A4A]')}>
                          {isMine ? 'You' : msg.authorName}
                        </span>
                        <span className="text-xs text-neutral-400">{formatRelativeTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">{msg.content}</p>
                    </div>
                    {/* Per-message actions */}
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => setOpenMenuMsgId(openMenuMsgId === msg.id ? null : msg.id)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <AnimatePresence>
                        {openMenuMsgId === msg.id && (
                          <MessageActionMenu
                            onForwardToTicket={() => { toast.success('Message forwarded to ticket queue'); setOpenMenuMsgId(null) }}
                            onAiSummarize={() => { toast.success('AI summary generated'); setOpenMenuMsgId(null) }}
                            onSaveToKB={() => { toast.success('Saved to Knowledge Base'); setOpenMenuMsgId(null) }}
                            onClose={() => setOpenMenuMsgId(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 pb-5">
            <div className="flex items-end gap-3 bg-neutral-50 rounded-xl border border-neutral-200 px-4 py-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={`Message #${activeChannel.name}`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E91E8C] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 ml-1">Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </main>

      {/* Create channel modal */}
      <AnimatePresence>
        {showCreateChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateChannel(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-[#1B2A4A] mb-4">Create Channel</h3>
              <div className="relative mb-4">
                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="channel-name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="pl-9"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateChannel() }}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 rounded-full" onClick={() => setShowCreateChannel(false)}>Cancel</Button>
                <Button className="flex-1 rounded-full" onClick={handleCreateChannel} disabled={!newChannelName}>Create</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
