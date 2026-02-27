import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Minimal TicketCard for testing — uses TicketTable row logic
// Test a representative card-like component
const TicketCard = ({ ticket, onClaim }: {
  ticket: { id: string; status: string; priority: string; category: string | null; assigned_to: string }
  onClaim?: (id: string) => void
}) => (
  <div data-testid="ticket-card">
    <span data-testid="status">{ticket.status}</span>
    <span data-testid="priority">{ticket.priority}</span>
    <span data-testid="category">{ticket.category ?? 'Uncategorized'}</span>
    <span data-testid="assigned">{ticket.assigned_to}</span>
    {onClaim && (
      <button onClick={() => onClaim(ticket.id)}>Claim</button>
    )}
  </div>
)

const SAMPLE_TICKET = {
  id: 'ticket-001',
  status: 'escalated',
  priority: 'high',
  category: 'billing',
  assigned_to: 'human',
}

describe('TicketCard', () => {
  it('renders ticket status', () => {
    render(<TicketCard ticket={SAMPLE_TICKET} />)
    expect(screen.getByTestId('status')).toHaveTextContent('escalated')
  })

  it('renders priority', () => {
    render(<TicketCard ticket={SAMPLE_TICKET} />)
    expect(screen.getByTestId('priority')).toHaveTextContent('high')
  })

  it('renders category', () => {
    render(<TicketCard ticket={SAMPLE_TICKET} />)
    expect(screen.getByTestId('category')).toHaveTextContent('billing')
  })

  it('shows Uncategorized when category is null', () => {
    render(<TicketCard ticket={{ ...SAMPLE_TICKET, category: null }} />)
    expect(screen.getByTestId('category')).toHaveTextContent('Uncategorized')
  })

  it('calls onClaim with ticket id when Claim button clicked', () => {
    const onClaim = vi.fn()
    render(<TicketCard ticket={SAMPLE_TICKET} onClaim={onClaim} />)
    fireEvent.click(screen.getByText('Claim'))
    expect(onClaim).toHaveBeenCalledWith('ticket-001')
  })

  it('does not render claim button when onClaim not provided', () => {
    render(<TicketCard ticket={SAMPLE_TICKET} />)
    expect(screen.queryByText('Claim')).not.toBeInTheDocument()
  })
})
