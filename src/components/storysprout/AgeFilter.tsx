'use client'

import { cn } from '@/lib/utils'
import { AgeBand, AGE_BANDS, StoryCategory, CATEGORIES } from '@/lib/storysprout/types'

interface AgeFilterProps {
  value: AgeBand | null
  onChange: (ageBand: AgeBand | null) => void
  showAll?: boolean
  className?: string
}

export function AgeFilter({
  value,
  onChange,
  showAll = true,
  className,
}: AgeFilterProps) {
  const ageBands = Object.values(AGE_BANDS)

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {showAll && (
        <button
          onClick={() => onChange(null)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-300',
            value === null
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          All Ages
        </button>
      )}
      {ageBands.map((band) => (
        <button
          key={band.id}
          onClick={() => onChange(band.id)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'flex items-center gap-2',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            value === band.id
              ? 'text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
          style={{
            backgroundColor: value === band.id ? band.color : undefined,
            '--tw-ring-color': band.color,
          } as React.CSSProperties}
        >
          <span>{band.icon}</span>
          <span>{band.label}</span>
          <span className="text-xs opacity-75">
            {band.ageRange[0]}-{band.ageRange[1]}
          </span>
        </button>
      ))}
    </div>
  )
}

// Large age band cards for child selection
interface AgeBandCardProps {
  ageBand: AgeBand
  isSelected?: boolean
  onClick?: () => void
  showDescription?: boolean
  className?: string
}

export function AgeBandCard({
  ageBand,
  isSelected = false,
  onClick,
  showDescription = false,
  className,
}: AgeBandCardProps) {
  const band = AGE_BANDS[ageBand]

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-6 rounded-2xl border-2 transition-all duration-200',
        'flex flex-col items-center text-center',
        'hover:shadow-lg active:scale-95',
        'focus:outline-none focus:ring-4',
        isSelected
          ? 'shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300',
        className
      )}
      style={{
        borderColor: isSelected ? band.color : undefined,
        backgroundColor: isSelected ? band.color + '15' : undefined,
        '--tw-ring-color': band.color + '50',
      } as React.CSSProperties}
    >
      <span className="text-4xl mb-3">{band.icon}</span>
      <span className="text-lg font-bold text-gray-900">{band.label}</span>
      <span className="text-sm text-gray-500">
        Ages {band.ageRange[0]}-{band.ageRange[1]}
      </span>
      {showDescription && (
        <p className="text-xs text-gray-400 mt-2">{band.readingFocus}</p>
      )}
    </button>
  )
}

// Category filter for story browsing
interface CategoryFilterProps {
  value: StoryCategory | null
  onChange: (category: StoryCategory | null) => void
  showAll?: boolean
  className?: string
}

export function CategoryFilter({
  value,
  onChange,
  showAll = true,
  className,
}: CategoryFilterProps) {
  const categories = Object.values(CATEGORIES)

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {showAll && (
        <button
          onClick={() => onChange(null)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-300',
            value === null
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          All Stories
        </button>
      )}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'flex items-center gap-2',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            value === category.id
              ? 'text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
          style={{
            backgroundColor: value === category.id ? category.color : undefined,
            '--tw-ring-color': category.color,
          } as React.CSSProperties}
        >
          <span>{category.icon}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  )
}

// Large category cards for browsing
interface CategoryCardProps {
  category: StoryCategory
  storyCount?: number
  onClick?: () => void
  className?: string
}

export function CategoryCard({
  category,
  storyCount,
  onClick,
  className,
}: CategoryCardProps) {
  const cat = CATEGORIES[category]

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-5 rounded-2xl transition-all duration-200',
        'flex items-center gap-4 w-full text-left',
        'hover:shadow-lg active:scale-98',
        'focus:outline-none focus:ring-4 focus:ring-primary-300',
        className
      )}
      style={{ backgroundColor: cat.color + '20' }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: cat.color + '30' }}
      >
        {cat.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900">{cat.label}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{cat.description}</p>
      </div>
      {storyCount !== undefined && (
        <span className="text-sm font-medium text-gray-500">
          {storyCount} stories
        </span>
      )}
    </button>
  )
}
