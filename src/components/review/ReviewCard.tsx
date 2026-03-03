import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import type { Review, Profile } from '@/types/database'

interface ReviewCardProps {
  review: Review & {
    reviewer: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const isGood = review.rating === 'good'

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
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
            isGood
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {isGood ? '👍 良かった' : '👎 残念だった'}
        </span>
      </div>
      {(review.tags?.length ?? 0) > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {review.tags!.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {review.comment && (
        <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
      )}
    </div>
  )
}
