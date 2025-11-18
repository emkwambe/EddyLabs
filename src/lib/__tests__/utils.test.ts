import { cn, formatDate, formatCurrency } from '../utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})

describe('formatDate', () => {
  it('should format date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('should format Date object', () => {
    const date = new Date('2024-06-20')
    const result = formatDate(date)
    expect(result).toContain('Jun')
    expect(result).toContain('20')
  })
})

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    const result = formatCurrency(1234.56)
    expect(result).toBe('$1,234.56')
  })

  it('should format with specified currency', () => {
    const result = formatCurrency(1000, 'EUR')
    expect(result).toContain('1,000')
  })

  it('should handle zero', () => {
    const result = formatCurrency(0)
    expect(result).toBe('$0.00')
  })

  it('should handle negative numbers', () => {
    const result = formatCurrency(-500)
    expect(result).toBe('-$500.00')
  })
})
