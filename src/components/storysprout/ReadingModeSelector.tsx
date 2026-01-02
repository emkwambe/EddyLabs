'use client'

import { cn } from '@/lib/utils'
import { ReadingMode, READING_MODES } from '@/lib/storysprout/types'

interface ReadingModeSelectorProps {
  value: ReadingMode
  onChange: (mode: ReadingMode) => void
  supportedModes?: ReadingMode[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ReadingModeSelector({
  value,
  onChange,
  supportedModes = ['read_to_me', 'read_with_me', 'read_alone'],
  size = 'md',
  className,
}: ReadingModeSelectorProps) {
  const modes = supportedModes.map((mode) => READING_MODES[mode])

  const sizeStyles = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-5 text-lg',
  }

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <div className={cn('grid gap-3', className)} style={{ gridTemplateColumns: `repeat(${modes.length}, 1fr)` }}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={cn(
            'rounded-2xl border-2 transition-all duration-200',
            'flex flex-col items-center text-center',
            'hover:shadow-lg active:scale-95',
            'focus:outline-none focus:ring-4 focus:ring-primary-300',
            sizeStyles[size],
            value === mode.id
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
        >
          <span className={cn('mb-2', iconSizes[size])}>{mode.icon}</span>
          <span className="font-semibold text-gray-900">{mode.label}</span>
          <span className="text-xs text-gray-500 mt-1 hidden sm:block">
            {mode.description}
          </span>
        </button>
      ))}
    </div>
  )
}

// Compact mode selector for inline use
interface ReadingModeChipsProps {
  value: ReadingMode
  onChange: (mode: ReadingMode) => void
  supportedModes?: ReadingMode[]
  className?: string
}

export function ReadingModeChips({
  value,
  onChange,
  supportedModes = ['read_to_me', 'read_with_me', 'read_alone'],
  className,
}: ReadingModeChipsProps) {
  const modes = supportedModes.map((mode) => READING_MODES[mode])

  return (
    <div className={cn('flex gap-2 flex-wrap', className)}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'flex items-center gap-2',
            'focus:outline-none focus:ring-2 focus:ring-primary-300',
            value === mode.id
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  )
}
