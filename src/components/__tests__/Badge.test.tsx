import { render, screen } from '@testing-library/react'
import { Badge, RiskBadge } from '../ui/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>)
    expect(container.firstChild).toHaveClass('bg-danger-100')
  })
})

describe('RiskBadge', () => {
  it('renders SAFE label correctly', () => {
    render(<RiskBadge label="SAFE" />)
    expect(screen.getByText('Safe')).toBeInTheDocument()
  })

  it('renders MILD_CONCERN label correctly', () => {
    render(<RiskBadge label="MILD_CONCERN" />)
    expect(screen.getByText('Mild Concern')).toBeInTheDocument()
  })

  it('renders HIGH_CONCERN label correctly', () => {
    render(<RiskBadge label="HIGH_CONCERN" />)
    expect(screen.getByText('High Concern')).toBeInTheDocument()
  })
})
