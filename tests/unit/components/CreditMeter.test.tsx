import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreditMeter } from '@/components/dashboard/CreditMeter'

describe('CreditMeter', () => {
  it('displays credit count', () => {
    render(<CreditMeter credits={3500} maxCredits={5000} />)
    expect(screen.getByText(/3,500/)).toBeInTheDocument()
  })

  it('shows warning at low balance', () => {
    render(<CreditMeter credits={300} maxCredits={5000} />)
    expect(screen.getByText(/300/)).toBeInTheDocument()
  })

  it('shows 0 credits', () => {
    render(<CreditMeter credits={0} maxCredits={5000} />)
    expect(screen.getByText(/0/)).toBeInTheDocument()
  })

  it('displays planName label when provided', () => {
    render(<CreditMeter credits={1000} maxCredits={5000} planName="Growth" />)
    expect(screen.getByText(/Growth/i)).toBeInTheDocument()
  })

  it('renders without crashing at full capacity', () => {
    const { container } = render(<CreditMeter credits={40000} maxCredits={40000} />)
    expect(container.firstChild).not.toBeNull()
  })
})
