'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReviewForm } from '@/components/review/ReviewForm'
import { CostumeReviewSection } from '@/components/review/CostumeReviewSection'
import type { CostumeReviewData } from '@/components/review/CostumeReviewSection'
import { Card, CardContent } from '@/components/ui/Card'
import type { ReviewRole } from '@/types/database'

interface ReviewSubmitClientProps {
  rentalId: string
  reviewerId: string
  revieweeId: string
  role: ReviewRole
  costumeId?: string
}

const DEFAULT_COSTUME_DATA: CostumeReviewData = {
  size_fit: null,
  photo_match: null,
  condition: null,
  recommended_scene: [],
  comment: '',
}

export function ReviewSubmitClient({ rentalId, reviewerId, revieweeId, role, costumeId }: ReviewSubmitClientProps) {
  const router = useRouter()
  const [costumeData, setCostumeData] = useState<CostumeReviewData>(DEFAULT_COSTUME_DATA)
  const [costumeError, setCostumeError] = useState(false)

  const showCostumeReview = role === 'renter' && !!costumeId

  async function handleSubmit(data: Record<string, unknown>) {
    // Validate costume review fields when required
    if (showCostumeReview) {
      if (!costumeData.size_fit || !costumeData.photo_match || !costumeData.condition) {
        setCostumeError(true)
        throw new Error('衣装評価の必須項目を選択してください')
      }
    }

    const supabase = createClient()

    // Insert user review
    const { error } = await supabase.from('reviews').insert({
      rental_id: rentalId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      role,
      rating: data.rating as string,
      tags: (data.tags as string[]) ?? [],
      comment: (data.comment as string) ?? null,
      is_published: false,
    })
    if (error) throw error

    // Insert costume review (renter only)
    if (showCostumeReview && costumeId) {
      await supabase.from('costume_reviews').insert({
        rental_id: rentalId,
        costume_id: costumeId,
        reviewer_id: reviewerId,
        size_fit: costumeData.size_fit,
        photo_match: costumeData.photo_match,
        condition: costumeData.condition,
        recommended_scene: costumeData.recommended_scene,
        comment: costumeData.comment || null,
      })
    }

    // Try to publish user reviews (both submitted or 7 days elapsed)
    await supabase.rpc('try_publish_reviews', { p_rental_id: rentalId })

    router.push(`/rentals/${rentalId}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {showCostumeReview && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">衣装について</h2>
            <CostumeReviewSection
              value={costumeData}
              onChange={(data) => {
                setCostumeData(data)
                if (costumeError) setCostumeError(false)
              }}
              hasError={costumeError}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {showCostumeReview && (
            <h2 className="mb-4 text-base font-semibold text-gray-900">出品者について</h2>
          )}
          <ReviewForm role={role} onSubmit={handleSubmit as never} />
        </CardContent>
      </Card>
    </div>
  )
}
