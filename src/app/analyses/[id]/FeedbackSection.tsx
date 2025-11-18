'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface FeedbackSectionProps {
  analysisId: string
  existingFeedback?: {
    rating: 'UP' | 'DOWN'
    comment: string | null
  }
}

export function FeedbackSection({ analysisId, existingFeedback }: FeedbackSectionProps) {
  const [rating, setRating] = useState<'UP' | 'DOWN' | null>(existingFeedback?.rating || null)
  const [comment, setComment] = useState(existingFeedback?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingFeedback)

  const handleSubmit = async (selectedRating: 'UP' | 'DOWN') => {
    setRating(selectedRating)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/analyses/${analysisId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          comment: comment || null,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">
          {rating === 'UP' ? (
            <>Thanks for the positive feedback!</>
          ) : (
            <>Thanks for your feedback. We'll work to improve.</>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        <Button
          variant={rating === 'UP' ? 'primary' : 'secondary'}
          onClick={() => handleSubmit('UP')}
          disabled={isSubmitting}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Helpful
        </Button>
        <Button
          variant={rating === 'DOWN' ? 'danger' : 'secondary'}
          onClick={() => handleSubmit('DOWN')}
          disabled={isSubmitting}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          Not Helpful
        </Button>
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional: Tell us how we can improve..."
          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          rows={3}
        />
      </div>
    </div>
  )
}
