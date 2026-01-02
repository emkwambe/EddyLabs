'use client'

import { cn } from '@/lib/utils'
import type { StoryPath, Story, StoryWithProgress } from '@/lib/storysprout/types'
import { STORY_PATH_ICONS } from '@/lib/storysprout/types'

interface ProgressPathProps {
  path: StoryPath
  stories: (Story | StoryWithProgress)[]
  currentStoryIndex?: number
  onStoryClick?: (story: Story | StoryWithProgress, index: number) => void
  className?: string
}

export function ProgressPath({
  path,
  stories,
  currentStoryIndex,
  onStoryClick,
  className,
}: ProgressPathProps) {
  const pathIcon = STORY_PATH_ICONS[path.path_type as keyof typeof STORY_PATH_ICONS] || '📚'

  return (
    <div className={cn('relative', className)}>
      {/* Path Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: path.color_theme + '20' }}
        >
          {pathIcon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{path.name}</h2>
          {path.description && (
            <p className="text-sm text-gray-500">{path.description}</p>
          )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="relative pl-6">
        {/* Vertical Line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-1 rounded-full"
          style={{ backgroundColor: path.color_theme + '30' }}
        />

        {/* Story Nodes */}
        <div className="space-y-4">
          {stories.map((story, index) => {
            const progress = 'is_completed' in story ? story : null
            const isCompleted = progress?.is_completed
            const isCurrent = index === currentStoryIndex
            const isLocked = !isCompleted && index > 0 && stories[index - 1] &&
              !('is_completed' in stories[index - 1] && stories[index - 1].is_completed)

            return (
              <button
                key={story.id}
                onClick={() => !isLocked && onStoryClick?.(story, index)}
                disabled={isLocked}
                className={cn(
                  'relative flex items-start gap-4 w-full text-left p-4 rounded-xl transition-all duration-200',
                  'focus:outline-none focus:ring-4 focus:ring-primary-300',
                  isCurrent && 'bg-primary-50 ring-2 ring-primary-300',
                  !isCurrent && !isLocked && 'hover:bg-gray-50',
                  isLocked && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Node Circle */}
                <div
                  className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    isCompleted && 'text-white',
                    !isCompleted && isCurrent && 'text-primary-600 border-2 border-primary-500 bg-white',
                    !isCompleted && !isCurrent && 'text-gray-400 border-2 border-gray-300 bg-white'
                  )}
                  style={{
                    backgroundColor: isCompleted ? path.color_theme : undefined,
                  }}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isLocked ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Story Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'font-semibold truncate',
                    isCompleted ? 'text-gray-900' : 'text-gray-700'
                  )}>
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{story.estimated_read_time_minutes} min</span>
                    <span>•</span>
                    <span>{story.page_count} pages</span>
                    {progress?.read_count && progress.read_count > 1 && (
                      <>
                        <span>•</span>
                        <span>Read {progress.read_count}x</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Arrow */}
                {!isLocked && (
                  <div className="flex items-center">
                    <svg
                      className={cn(
                        'w-5 h-5 transition-transform',
                        isCurrent ? 'text-primary-500' : 'text-gray-400'
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Simple progress indicator for story paths
interface PathProgressIndicatorProps {
  completed: number
  total: number
  color?: string
  size?: 'sm' | 'md'
  className?: string
}

export function PathProgressIndicator({
  completed,
  total,
  color = '#4F46E5',
  size = 'md',
  className,
}: PathProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'flex-1 rounded-full bg-gray-200',
        size === 'sm' ? 'h-1.5' : 'h-2'
      )}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className={cn(
        'font-medium text-gray-600 whitespace-nowrap',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {completed}/{total}
      </span>
    </div>
  )
}
