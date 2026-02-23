import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { formatDate } from '@/lib/utils'
import type { Review, Profile } from '@/types/database'

interface ReviewCardProps {
  review: Review & {
    reviewer: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar src={review.reviewer.avatar_url} name={review.reviewer.name} size="sm" />
        <div>
          <p className="text-sm font-medium text-gray-900">{review.reviewer.name ?? '名前未設定'}</p>
          <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
        </div>
      </div>
      <div className="mt-3">
        <StarRating value={review.rating} readonly size="sm" />
      </div>
      {review.comment && (
        <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
      )}
    </div>
  )
}
