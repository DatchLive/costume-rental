import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import {
  COSTUME_REVIEW_SIZE_FIT_LABELS,
  COSTUME_REVIEW_PHOTO_MATCH_LABELS,
  COSTUME_REVIEW_CONDITION_LABELS,
  COSTUME_REVIEW_SCENE_LABELS,
} from '@/lib/constants'
import type { CostumeReview, Profile } from '@/types/database'

type CostumeReviewWithReviewer = CostumeReview & {
  reviewer: Pick<Profile, 'id' | 'name' | 'avatar_url'>
}

interface CostumeReviewCardProps {
  review: CostumeReviewWithReviewer
}


export function CostumeReviewCard({ review }: CostumeReviewCardProps) {
  const meta: { label: string; value: string }[] = []
  if (review.size_fit)
    meta.push({
      label: 'サイズ感',
      value: COSTUME_REVIEW_SIZE_FIT_LABELS[review.size_fit] ?? review.size_fit,
    })
  if (review.photo_match)
    meta.push({
      label: '写真との一致度',
      value: COSTUME_REVIEW_PHOTO_MATCH_LABELS[review.photo_match] ?? review.photo_match,
    })
  if (review.condition)
    meta.push({
      label: 'コンディション',
      value: COSTUME_REVIEW_CONDITION_LABELS[review.condition] ?? review.condition,
    })

  const scenes = (review.recommended_scene ?? [])
    .map((s) => COSTUME_REVIEW_SCENE_LABELS[s] ?? s)
    .filter(Boolean)

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      {/* Reviewer */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar src={review.reviewer.avatar_url} name={review.reviewer.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{review.reviewer.name ?? '匿名'}</p>
            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
          </div>
        </div>
        {review.rating && (
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              review.rating === 'good' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {review.rating === 'good' ? '👍 良かった' : '👎 残念だった'}
          </span>
        )}
      </div>

      {/* Meta info */}
      {meta.length > 0 && (
        <dl className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
          {meta.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-1 text-xs">
              <dt className="text-gray-400">{label}:</dt>
              <dd className="font-medium text-gray-700">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Recommended scenes */}
      {scenes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {scenes.map((scene) => (
            <span
              key={scene}
              className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
            >
              {scene}
            </span>
          ))}
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-sm whitespace-pre-wrap text-gray-600">{review.comment}</p>
      )}
    </div>
  )
}
