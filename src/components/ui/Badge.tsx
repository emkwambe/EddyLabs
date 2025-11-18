import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function RiskBadge({ label }: { label: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger'> = {
    SAFE: 'success',
    MILD_CONCERN: 'warning',
    HIGH_CONCERN: 'danger',
  }

  const labels: Record<string, string> = {
    SAFE: 'Safe',
    MILD_CONCERN: 'Mild Concern',
    HIGH_CONCERN: 'High Concern',
  }

  return (
    <Badge variant={variants[label] || 'default'}>
      {labels[label] || label}
    </Badge>
  )
}
