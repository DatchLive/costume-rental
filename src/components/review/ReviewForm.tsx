'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { ownerReviewSchema, renterReviewSchema } from '@/lib/validations/review'
import type { OwnerReviewFormData, RenterReviewFormData } from '@/lib/validations/review'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ReviewRole, RatingValue } from '@/types/database'

type ReviewFormData = OwnerReviewFormData | RenterReviewFormData

interface ReviewFormProps {
  role: ReviewRole
  onSubmit: (data: ReviewFormData) => Promise<void>
}

const ratingOptions: { value: RatingValue; label: string; icon: typeof ThumbsUp; activeClass: string }[] = [
  { value: 'good', label: '良かった', icon: ThumbsUp, activeClass: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'bad', label: '残念だった', icon: ThumbsDown, activeClass: 'border-red-400 bg-red-50 text-red-600' },
]

export function ReviewForm({ role, onSubmit }: ReviewFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const schema = role === 'owner' ? ownerReviewSchema : renterReviewSchema

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(schema) as never,
  })

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

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">総合評価 *</p>
        <Controller
          name="rating"
          control={control as never}
          render={({ field }) => (
            <div className="flex gap-3">
              {ratingOptions.map(({ value, label, icon: Icon, activeClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-colors',
                    field.value === value
                      ? activeClass
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          )}
        />
        {(errors as Record<string, { message?: string }>).rating && (
          <p className="mt-1 text-xs text-red-500">
            {(errors as Record<string, { message?: string }>).rating?.message}
          </p>
        )}
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
