import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageBubble } from '@/components/agent/MessageBubble'
import type { Message } from '@/lib/types'

const BASE_MSG: Message = {
  id: 'msg-1',
  ticket_id: 'tkt-1',
  company_id: 'co-1',
  sender_type: 'customer',
  sender_id: 'cust-1',
  content: 'Hello, I need help',
  is_helpful: null,
  created_at: new Date('2024-01-01T10:00:00Z'),
}

describe('MessageBubble', () => {
  it('renders message content', () => {
    render(<MessageBubble message={BASE_MSG} />)
    expect(screen.getByText('Hello, I need help')).toBeInTheDocument()
  })

  it('renders without crashing for customer sender', () => {
    const { container } = render(<MessageBubble message={BASE_MSG} />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders AI message with AI label', () => {
    const aiMsg: Message = { ...BASE_MSG, sender_type: 'ai', content: 'AI response here' }
    render(<MessageBubble message={aiMsg} />)
    expect(screen.getByText('AI response here')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders agent message with Agent label', () => {
    const agentMsg: Message = { ...BASE_MSG, sender_type: 'agent', content: 'Agent reply' }
    render(<MessageBubble message={agentMsg} />)
    expect(screen.getByText('Agent reply')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
  })

  it('renders content for null created_at', () => {
    const msg: Message = { ...BASE_MSG, created_at: null }
    render(<MessageBubble message={msg} />)
    expect(screen.getByText('Hello, I need help')).toBeInTheDocument()
  })
})
