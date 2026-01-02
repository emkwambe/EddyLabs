'use client'

import { cn } from '@/lib/utils'
import type { SightWordExposure } from '@/lib/storysprout/types'

interface SightWordBadgeProps {
  word: string
  exposure?: SightWordExposure
  isHighlighted?: boolean
  isTappable?: boolean
  onTap?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SightWordBadge({
  word,
  exposure,
  isHighlighted = false,
  isTappable = false,
  onTap,
  size = 'md',
  className,
}: SightWordBadgeProps) {
  const isMastered = exposure?.is_mastered
  const exposureCount = exposure?.exposure_count || 0

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const Component = isTappable ? 'button' : 'span'

  return (
    <Component
      onClick={isTappable ? onTap : undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all',
        sizeStyles[size],
        isHighlighted && 'bg-yellow-200 text-yellow-800',
        !isHighlighted && isMastered && 'bg-green-100 text-green-700',
        !isHighlighted && !isMastered && exposureCount > 0 && 'bg-blue-100 text-blue-700',
        !isHighlighted && !isMastered && exposureCount === 0 && 'bg-gray-100 text-gray-700',
        isTappable && 'cursor-pointer hover:shadow-md active:scale-95',
        isTappable && 'focus:outline-none focus:ring-2 focus:ring-primary-300',
        className
      )}
    >
      {word}
      {isMastered && <span className="text-green-500">✓</span>}
    </Component>
  )
}

// Sight word list component
interface SightWordListProps {
  words: string[]
  exposures?: Map<string, SightWordExposure>
  onWordTap?: (word: string) => void
  title?: string
  className?: string
}

export function SightWordList({
  words,
  exposures,
  onWordTap,
  title,
  className,
}: SightWordListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      )}
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <SightWordBadge
            key={word}
            word={word}
            exposure={exposures?.get(word)}
            isTappable={!!onWordTap}
            onTap={() => onWordTap?.(word)}
          />
        ))}
      </div>
    </div>
  )
}

// Sight word progress summary
interface SightWordProgressProps {
  ageBand: string
  totalWords: number
  masteredWords: number
  encounteredWords: number
  className?: string
}

export function SightWordProgress({
  ageBand,
  totalWords,
  masteredWords,
  encounteredWords,
  className,
}: SightWordProgressProps) {
  const masteredPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0
  const encounteredPercentage = totalWords > 0 ? Math.round((encounteredWords / totalWords) * 100) : 0

  return (
    <div className={cn('p-4 bg-white rounded-xl border border-gray-200', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Sight Words - {ageBand}</h3>
        <span className="text-sm text-gray-500">{encounteredWords}/{totalWords}</span>
      </div>

      {/* Progress bars */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20">Encountered</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${encounteredPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 w-10 text-right">
            {encounteredPercentage}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20">Mastered</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${masteredPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 w-10 text-right">
            {masteredPercentage}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-200" />
          <span>Not seen</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Seen</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span>Mastered</span>
        </div>
      </div>
    </div>
  )
}

// Inline highlighted word in story text
interface HighlightedWordProps {
  word: string
  isSightWord?: boolean
  isCurrentlyPlaying?: boolean
  onClick?: () => void
  className?: string
}

export function HighlightedWord({
  word,
  isSightWord = false,
  isCurrentlyPlaying = false,
  onClick,
  className,
}: HighlightedWordProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'transition-all duration-150 rounded px-0.5 cursor-pointer',
        isCurrentlyPlaying && 'bg-yellow-300 text-gray-900',
        !isCurrentlyPlaying && isSightWord && 'text-primary-600 underline decoration-dotted',
        onClick && 'hover:bg-gray-100',
        className
      )}
    >
      {word}
    </span>
  )
}
