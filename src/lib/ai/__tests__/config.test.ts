import {
  calculateRiskScore,
  getRiskLabel,
  SUSPICIOUS_FEE_PATTERNS,
  PREDATORY_TERM_PATTERNS,
} from '../config'

describe('Risk Score Calculation', () => {
  it('should return 0 for no flags', () => {
    const score = calculateRiskScore([])
    expect(score).toBe(0)
  })

  it('should calculate score based on severity', () => {
    const flags = [
      { severity: 'HIGH' },
      { severity: 'MEDIUM' },
      { severity: 'LOW' },
    ]
    const score = calculateRiskScore(flags)
    expect(score).toBe(45) // 25 + 15 + 5
  })

  it('should cap score at 100', () => {
    const flags = [
      { severity: 'HIGH' },
      { severity: 'HIGH' },
      { severity: 'HIGH' },
      { severity: 'HIGH' },
      { severity: 'HIGH' },
    ]
    const score = calculateRiskScore(flags)
    expect(score).toBe(100)
  })
})

describe('Risk Label', () => {
  it('should return SAFE for score <= 20', () => {
    expect(getRiskLabel(0)).toBe('SAFE')
    expect(getRiskLabel(10)).toBe('SAFE')
    expect(getRiskLabel(20)).toBe('SAFE')
  })

  it('should return MILD_CONCERN for score 21-50', () => {
    expect(getRiskLabel(21)).toBe('MILD_CONCERN')
    expect(getRiskLabel(35)).toBe('MILD_CONCERN')
    expect(getRiskLabel(50)).toBe('MILD_CONCERN')
  })

  it('should return HIGH_CONCERN for score > 50', () => {
    expect(getRiskLabel(51)).toBe('HIGH_CONCERN')
    expect(getRiskLabel(75)).toBe('HIGH_CONCERN')
    expect(getRiskLabel(100)).toBe('HIGH_CONCERN')
  })
})

describe('Pattern Configurations', () => {
  it('should have suspicious fee patterns', () => {
    expect(SUSPICIOUS_FEE_PATTERNS.length).toBeGreaterThan(0)
    expect(SUSPICIOUS_FEE_PATTERNS).toContain('processing fee')
    expect(SUSPICIOUS_FEE_PATTERNS).toContain('facility fee')
  })

  it('should have predatory term patterns', () => {
    expect(PREDATORY_TERM_PATTERNS.length).toBeGreaterThan(0)
    expect(PREDATORY_TERM_PATTERNS).toContain('auto-renewal')
    expect(PREDATORY_TERM_PATTERNS).toContain('early termination fee')
  })
})
