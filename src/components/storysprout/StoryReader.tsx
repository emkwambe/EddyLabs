'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Story, StoryPage, ReadingMode, SightWordPosition } from '@/lib/storysprout/types'
import { READING_MODES } from '@/lib/storysprout/types'
import { ReadingModeChips } from './ReadingModeSelector'
import { HighlightedWord } from './SightWordBadge'

interface StoryReaderProps {
  story: Story
  pages: StoryPage[]
  initialPage?: number
  initialMode?: ReadingMode
  onPageChange?: (page: number) => void
  onModeChange?: (mode: ReadingMode) => void
  onComplete?: () => void
  onClose?: () => void
  onSightWordTap?: (word: string) => void
  className?: string
}

export function StoryReader({
  story,
  pages,
  initialPage = 1,
  initialMode = 'read_with_me',
  onPageChange,
  onModeChange,
  onComplete,
  onClose,
  onSightWordTap,
  className,
}: StoryReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [readingMode, setReadingMode] = useState<ReadingMode>(initialMode)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [showControls, setShowControls] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const page = pages[currentPage - 1]
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === pages.length
  const sightWordsSet = new Set(story.sight_words.map(w => w.toLowerCase()))

  // Handle page navigation
  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= pages.length) {
      setCurrentPage(pageNum)
      setCurrentWordIndex(-1)
      setIsPlaying(false)
      onPageChange?.(pageNum)
    }
  }, [pages.length, onPageChange])

  const nextPage = useCallback(() => {
    if (isLastPage) {
      onComplete?.()
    } else {
      goToPage(currentPage + 1)
    }
  }, [isLastPage, currentPage, goToPage, onComplete])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  // Handle reading mode change
  const handleModeChange = (mode: ReadingMode) => {
    setReadingMode(mode)
    setIsPlaying(false)
    setCurrentWordIndex(-1)
    onModeChange?.(mode)
  }

  // Handle audio playback for read-to-me and read-with-me modes
  const togglePlayback = useCallback(() => {
    if (readingMode === 'read_alone') return

    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      // Simulate word-by-word highlighting if no audio
      if (!page?.audio_url && page?.text_content) {
        const words = page.text_content.split(/\s+/)
        let wordIndex = 0
        setIsPlaying(true)
        setCurrentWordIndex(0)

        const interval = setInterval(() => {
          wordIndex++
          if (wordIndex >= words.length) {
            clearInterval(interval)
            setIsPlaying(false)
            setCurrentWordIndex(-1)
            // Auto-advance in read-to-me mode
            if (readingMode === 'read_to_me' && !isLastPage) {
              setTimeout(nextPage, 1000)
            }
          } else {
            setCurrentWordIndex(wordIndex)
          }
        }, 400) // Adjust speed as needed

        return () => clearInterval(interval)
      }
    }
  }, [readingMode, isPlaying, page, isLastPage, nextPage])

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, currentPage])

  // Handle tap/click to show controls
  const handleTap = () => {
    setShowControls(true)
  }

  // Render text with word highlighting
  const renderText = () => {
    if (!page?.text_content) return null

    const words = page.text_content.split(/(\s+)/)

    return (
      <p className={cn(
        'text-2xl md:text-3xl leading-relaxed text-gray-900 font-serif',
        readingMode === 'read_alone' && 'text-gray-800'
      )}>
        {words.map((segment, index) => {
          // Skip whitespace
          if (/^\s+$/.test(segment)) {
            return <span key={index}>{segment}</span>
          }

          // Clean word for comparison
          const cleanWord = segment.replace(/[.,!?;:'"]/g, '').toLowerCase()
          const isSightWord = sightWordsSet.has(cleanWord)
          const wordIndex = words.filter((w, i) => i < index && !/^\s+$/.test(w)).length
          const isCurrentWord = currentWordIndex === wordIndex && isPlaying

          if (readingMode === 'read_alone') {
            return <span key={index}>{segment}</span>
          }

          return (
            <HighlightedWord
              key={index}
              word={segment}
              isSightWord={isSightWord && readingMode === 'read_with_me'}
              isCurrentlyPlaying={isCurrentWord}
              onClick={isSightWord ? () => onSightWordTap?.(cleanWord) : undefined}
            />
          )
        })}
      </p>
    )
  }

  return (
    <div
      className={cn(
        'fixed inset-0 bg-amber-50 flex flex-col',
        className
      )}
      onClick={handleTap}
    >
      {/* Header Controls */}
      <header
        className={cn(
          'absolute top-0 left-0 right-0 z-20 transition-all duration-300',
          'bg-gradient-to-b from-black/30 to-transparent',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            className="p-3 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-white/90 text-sm font-medium text-gray-700 shadow-lg">
              {currentPage} / {pages.length}
            </span>
          </div>

          {/* Mode selector for touch devices */}
          <div onClick={(e) => e.stopPropagation()}>
            <ReadingModeChips
              value={readingMode}
              onChange={handleModeChange}
              supportedModes={story.modes_supported}
              className="hidden md:flex"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 pt-20 pb-32">
        <div className="max-w-2xl w-full">
          {/* Illustration */}
          {page?.illustration_url && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={page.illustration_url}
                alt={page.illustration_alt_text || `Page ${currentPage} illustration`}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          )}

          {/* Story Text */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            {renderText()}
          </div>

          {/* Sight Words on this page (read_with_me mode) */}
          {readingMode === 'read_with_me' && story.sight_words.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {story.sight_words
                .filter(word => page?.text_content?.toLowerCase().includes(word.toLowerCase()))
                .map((word) => (
                  <button
                    key={word}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSightWordTap?.(word)
                    }}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors"
                  >
                    {word}
                  </button>
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Controls */}
      <footer
        className={cn(
          'absolute bottom-0 left-0 right-0 z-20 transition-all duration-300',
          'bg-gradient-to-t from-black/30 to-transparent',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="p-6">
          {/* Mobile mode selector */}
          <div onClick={(e) => e.stopPropagation()} className="mb-4 md:hidden">
            <ReadingModeChips
              value={readingMode}
              onChange={handleModeChange}
              supportedModes={story.modes_supported}
              className="justify-center"
            />
          </div>

          {/* Navigation and Play */}
          <div className="flex items-center justify-center gap-4">
            {/* Previous */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevPage()
              }}
              disabled={isFirstPage}
              className={cn(
                'p-4 rounded-full bg-white/90 shadow-lg transition-all',
                isFirstPage
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white hover:scale-110'
              )}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Play/Pause (not for read_alone) */}
            {readingMode !== 'read_alone' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlayback()
                }}
                className="p-5 rounded-full bg-primary-500 shadow-lg hover:bg-primary-600 hover:scale-110 transition-all"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            )}

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextPage()
              }}
              className="p-4 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all"
            >
              {isLastPage ? (
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex justify-center">
            <div className="flex gap-1.5">
              {pages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPage(index + 1)
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index + 1 === currentPage
                      ? 'w-6 bg-primary-500'
                      : index + 1 < currentPage
                        ? 'bg-primary-300'
                        : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Audio element */}
      {page?.audio_url && (
        <audio ref={audioRef} src={page.audio_url} />
      )}
    </div>
  )
}

// Story completion modal
interface StoryCompleteModalProps {
  story: Story
  readCount: number
  onReadAgain: () => void
  onClose: () => void
}

export function StoryCompleteModal({
  story,
  readCount,
  onReadAgain,
  onClose,
}: StoryCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
        {/* Celebration */}
        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Great Reading!
        </h2>

        <p className="text-gray-600 mb-6">
          You finished "{story.title}"!
          {readCount > 1 && ` You've read this ${readCount} times!`}
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <span key={star} className="text-4xl animate-pulse" style={{ animationDelay: `${star * 0.2}s` }}>
              ⭐
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={onReadAgain}
            className="w-full py-3 px-6 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
          >
            Read Again
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Choose Another Story
          </button>
        </div>
      </div>
    </div>
  )
}
