import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge, PriorityBadge, SentimentBadge, AgentStatusDot } from '@/components/shared/StatusBadge'

describe('StatusBadge', () => {
  it('renders "open" status', () => {
    render(<StatusBadge value="open" />)
    expect(screen.getByText('open')).toBeInTheDocument()
  })

  it('renders "in_progress" status', () => {
    render(<StatusBadge value="in_progress" />)
    expect(screen.getByText('in progress')).toBeInTheDocument()
  })

  it('renders "escalated" status', () => {
    render(<StatusBadge value="escalated" />)
    expect(screen.getByText('escalated')).toBeInTheDocument()
  })

  it('renders "resolved" status', () => {
    render(<StatusBadge value="resolved" />)
    expect(screen.getByText('resolved')).toBeInTheDocument()
  })

  it('renders "closed" status', () => {
    render(<StatusBadge value="closed" />)
    expect(screen.getByText('closed')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<StatusBadge value="open" className="test-class" />)
    expect(container.firstChild).toHaveClass('test-class')
  })
})

describe('PriorityBadge', () => {
  it('renders "urgent" priority', () => {
    render(<PriorityBadge value="urgent" />)
    expect(screen.getByText('urgent')).toBeInTheDocument()
  })

  it('renders "high" priority', () => {
    render(<PriorityBadge value="high" />)
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders "normal" priority', () => {
    render(<PriorityBadge value="normal" />)
    expect(screen.getByText('normal')).toBeInTheDocument()
  })

  it('renders "low" priority', () => {
    render(<PriorityBadge value="low" />)
    expect(screen.getByText('low')).toBeInTheDocument()
  })
})

describe('SentimentBadge', () => {
  it('renders "positive" sentiment', () => {
    render(<SentimentBadge value="positive" />)
    expect(screen.getByText('positive')).toBeInTheDocument()
  })

  it('renders "angry" sentiment', () => {
    render(<SentimentBadge value="angry" />)
    expect(screen.getByText('angry')).toBeInTheDocument()
  })
})

describe('AgentStatusDot', () => {
  it('renders green dot for online', () => {
    const { container } = render(<AgentStatusDot status="online" />)
    expect(container.firstChild).toHaveClass('bg-green-500')
  })

  it('renders yellow dot for away', () => {
    const { container } = render(<AgentStatusDot status="away" />)
    expect(container.firstChild).toHaveClass('bg-yellow-500')
  })

  it('renders dot for offline', () => {
    const { container } = render(<AgentStatusDot status="offline" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toMatch(/gray|neutral/)
  })
})
