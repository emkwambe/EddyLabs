'use client'

import { cn } from '@/lib/utils'
import type { ChildProfile, ChildReadingSummary } from '@/lib/storysprout/types'
import { AGE_BANDS, CHILD_AVATARS } from '@/lib/storysprout/types'

interface ChildProfileCardProps {
  profile: ChildProfile
  summary?: ChildReadingSummary | null
  isSelected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ChildProfileCard({
  profile,
  summary,
  isSelected = false,
  onClick,
  size = 'md',
  className,
}: ChildProfileCardProps) {
  const ageBand = AGE_BANDS[profile.age_band]
  const avatar = profile.avatar_url
    ? CHILD_AVATARS.find((a) => a.id === profile.avatar_url) || CHILD_AVATARS[0]
    : CHILD_AVATARS[0]

  const sizeStyles = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }

  const avatarSizes = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-2xl p-4 transition-all duration-200',
        'flex flex-col items-center justify-center',
        'hover:shadow-lg active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-primary-300',
        sizeStyles[size],
        isSelected
          ? 'ring-4 shadow-lg'
          : 'hover:ring-2 hover:ring-gray-300',
        className
      )}
      style={{
        backgroundColor: avatar.color + '30',
        '--tw-ring-color': ageBand.color,
      } as React.CSSProperties}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center mb-2',
          avatarSizes[size]
        )}
        style={{ backgroundColor: avatar.color }}
      >
        {avatar.emoji}
      </div>
      <span className="font-semibold text-gray-900 text-sm truncate max-w-full px-1">
        {profile.name}
      </span>
      {size !== 'sm' && (
        <span
          className="text-xs px-2 py-0.5 rounded-full mt-1"
          style={{ backgroundColor: ageBand.color + '30', color: ageBand.color }}
        >
          {ageBand.label}
        </span>
      )}
    </button>
  )
}

// Add child button
interface AddChildCardProps {
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AddChildCard({
  onClick,
  size = 'md',
  className,
}: AddChildCardProps) {
  const sizeStyles = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-2xl border-2 border-dashed border-gray-300 p-4 transition-all duration-200',
        'flex flex-col items-center justify-center',
        'hover:border-primary-400 hover:bg-primary-50',
        'focus:outline-none focus:ring-4 focus:ring-primary-300',
        sizeStyles[size],
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-sm text-gray-500">Add Child</span>
    </button>
  )
}

// Grid of child profiles
interface ChildProfileGridProps {
  profiles: ChildProfile[]
  selectedId?: string
  onProfileClick?: (profile: ChildProfile) => void
  onAddClick?: () => void
  showAddButton?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ChildProfileGrid({
  profiles,
  selectedId,
  onProfileClick,
  onAddClick,
  showAddButton = true,
  size = 'md',
  className,
}: ChildProfileGridProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 justify-center', className)}>
      {profiles.map((profile) => (
        <ChildProfileCard
          key={profile.id}
          profile={profile}
          isSelected={profile.id === selectedId}
          onClick={() => onProfileClick?.(profile)}
          size={size}
        />
      ))}
      {showAddButton && (
        <AddChildCard onClick={onAddClick} size={size} />
      )}
    </div>
  )
}

// Reading stats for a child
interface ChildReadingStatsProps {
  summary: ChildReadingSummary
  className?: string
}

export function ChildReadingStats({
  summary,
  className,
}: ChildReadingStatsProps) {
  const stats = [
    {
      label: 'Stories Read',
      value: summary.stories_completed,
      icon: '📚',
      color: '#4ECDC4',
    },
    {
      label: 'Reading Time',
      value: `${summary.total_reading_minutes} min`,
      icon: '⏱️',
      color: '#45B7D1',
    },
    {
      label: 'Sight Words',
      value: summary.sight_words_encountered,
      icon: '✨',
      color: '#96CEB4',
    },
  ]

  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-xl text-center"
          style={{ backgroundColor: stat.color + '20' }}
        >
          <span className="text-2xl">{stat.icon}</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {stat.value}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
