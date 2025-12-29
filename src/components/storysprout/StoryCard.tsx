'use client'

import { cn } from '@/lib/utils'
import type { Story, StoryWithProgress, AGE_BANDS, CATEGORIES } from '@/lib/storysprout/types'
import { AGE_BANDS as AgeBandConfig, CATEGORIES as CategoryConfig } from '@/lib/storysprout/types'

interface StoryCardProps {
  story: Story | StoryWithProgress
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  onClick?: () => void
  className?: string
}

export function StoryCard({
  story,
  size = 'md',
  showProgress = false,
  onClick,
  className,
}: StoryCardProps) {
  const ageBand = AgeBandConfig[story.age_band]
  const category = CategoryConfig[story.category]
  const progress = 'current_page' in story ? story : null

  const sizeStyles = {
    sm: 'w-32 h-44',
    md: 'w-40 h-56',
    lg: 'w-48 h-64',
  }

  const progressPercentage = progress?.current_page && progress?.is_completed !== null
    ? progress.is_completed
      ? 100
      : Math.round((progress.current_page / story.page_count) * 100)
    : 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-2xl overflow-hidden shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:scale-105 active:scale-100',
        'focus:outline-none focus:ring-4 focus:ring-primary-300',
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: ageBand.color + '20' }}
    >
      {/* Cover Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        {story.cover_image_url ? (
          <img
            src={story.cover_image_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-6xl"
            style={{ backgroundColor: ageBand.color + '30' }}
          >
            {category.icon}
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 className="font-semibold text-sm line-clamp-2 text-left">
          {story.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: ageBand.color }}
          >
            {ageBand.label}
          </span>
          <span className="text-xs opacity-80">
            {story.estimated_read_time_minutes} min
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && progress && progressPercentage > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/30">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Completed Badge */}
      {progress?.is_completed && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Premium Badge */}
      {story.is_premium && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500 text-xs font-medium text-white">
          Premium
        </div>
      )}
    </button>
  )
}

// Story Card List/Grid
interface StoryCardGridProps {
  stories: (Story | StoryWithProgress)[]
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  onStoryClick?: (story: Story | StoryWithProgress) => void
  className?: string
}

export function StoryCardGrid({
  stories,
  size = 'md',
  showProgress = false,
  onStoryClick,
  className,
}: StoryCardGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      size === 'sm' && 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
      size === 'md' && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
      size === 'lg' && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
      className
    )}>
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          size={size}
          showProgress={showProgress}
          onClick={() => onStoryClick?.(story)}
        />
      ))}
    </div>
  )
}

// Horizontal Scrolling Story List
interface StoryCardScrollProps extends Omit<StoryCardGridProps, 'className'> {
  title?: string
  className?: string
}

export function StoryCardScroll({
  stories,
  size = 'md',
  showProgress = false,
  onStoryClick,
  title,
  className,
}: StoryCardScrollProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 px-1">
          {title}
        </h2>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            size={size}
            showProgress={showProgress}
            onClick={() => onStoryClick?.(story)}
            className="flex-shrink-0"
          />
        ))}
      </div>
    </div>
  )
}
