'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ownerReviewSchema, renterReviewSchema } from '@/lib/validations/review'
import type { OwnerReviewFormData, RenterReviewFormData } from '@/lib/validations/review'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { ReviewRole } from '@/types/database'

type ReviewFormData = OwnerReviewFormData | RenterReviewFormData

interface ReviewFormProps {
  role: ReviewRole
  onSubmit: (data: ReviewFormData) => Promise<void>
}

const OWNER_TAGS = ['返却が丁寧だった', '連絡が早かった', 'クリーニングが丁寧だった']
const RENTER_TAGS = ['説明通りの衣装だった', '対応が丁寧だった', '発送・受け渡しが早かった']

export function ReviewForm({ role, onSubmit }: ReviewFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const isOwner = role === 'owner'
  const schema = isOwner ? ownerReviewSchema : renterReviewSchema
  const availableTags = isOwner ? OWNER_TAGS : RENTER_TAGS

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { tags: [] } as never,
  })

  const selectedRating = watch('rating' as never) as unknown as string | undefined
  const selectedTags = (watch('tags' as never) as unknown as string[]) ?? []

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      setValue('tags' as never, selectedTags.filter((t) => t !== tag) as never)
    } else {
      setValue('tags' as never, [...selectedTags, tag] as never)
    }
  }

  async function handleFormSubmit(data: ReviewFormData) {
    setServerError(null)
    try {
      await onSubmit(data)
    } catch {
      setServerError('送信中にエラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as never)} className="flex flex-col gap-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      {/* 総合評価 */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">総合評価 *</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('rating' as never, 'good' as never)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-4 text-base font-medium transition-colors ${
              selectedRating === 'good'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
            }`}
          >
            <span className="text-2xl">👍</span>
            良かった
          </button>
          <button
            type="button"
            onClick={() => setValue('rating' as never, 'bad' as never)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-4 text-base font-medium transition-colors ${
              selectedRating === 'bad'
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
            }`}
          >
            <span className="text-2xl">👎</span>
            残念だった
          </button>
        </div>
        {(errors as Record<string, { message?: string }>).rating && (
          <p className="mt-1 text-xs text-red-500">
            {(errors as Record<string, { message?: string }>).rating?.message}
          </p>
        )}
      </div>

      {/* タグ選択 */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">あてはまるものを選んでください（任意）</p>
        <div className="flex flex-col gap-2">
          {availableTags.map((tag) => (
            <label key={tag} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => toggleTag(tag)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <Textarea
        label="コメント（任意）"
        rows={4}
        maxLength={1000}
        placeholder="取引の感想をお書きください"
        {...register('comment')}
      />

      <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
        評価を送信する
      </Button>
    </form>
  )
}
