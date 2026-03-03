'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReviewForm } from '@/components/review/ReviewForm'
import type { ReviewRole } from '@/types/database'

interface ReviewSubmitClientProps {
  rentalId: string
  reviewerId: string
  revieweeId: string
  role: ReviewRole
}

export function ReviewSubmitClient({ rentalId, reviewerId, revieweeId, role }: ReviewSubmitClientProps) {
  const router = useRouter()

  async function handleSubmit(data: Record<string, unknown>) {
    const supabase = createClient()
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

    // Try to publish reviews (both submitted or 7 days elapsed)
    await supabase.rpc('try_publish_reviews', { p_rental_id: rentalId })

    router.push(`/rentals/${rentalId}`)
    router.refresh()
  }

  return <ReviewForm role={role} onSubmit={handleSubmit as never} />
}
