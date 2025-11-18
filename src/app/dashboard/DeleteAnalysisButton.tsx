'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'

export function DeleteAnalysisButton({ analysisId }: { analysisId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this analysis?')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete analysis')
      }
    } catch {
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-gray-500 hover:text-danger-600"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
