'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ownerReviewSchema, renterReviewSchema } from '@/lib/validations/review'
import type { OwnerReviewFormData, RenterReviewFormData } from '@/lib/validations/review'
import { StarRating } from '@/components/ui/StarRating'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { ReviewRole } from '@/types/database'

type ReviewFormData = OwnerReviewFormData | RenterReviewFormData

interface ReviewFormProps {
  role: ReviewRole
  onSubmit: (data: ReviewFormData) => Promise<void>
}

export function ReviewForm({ role, onSubmit }: ReviewFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const isOwner = role === 'owner'
  const schema = isOwner ? ownerReviewSchema : renterReviewSchema

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

      <Controller
        name="rating"
        control={control as never}
        render={({ field }) => (
          <StarRating
            label="総合評価 *"
            value={field.value as number}
            onChange={field.onChange}
            size="lg"
          />
        )}
      />
      {(errors as Record<string, { message?: string }>).rating && (
        <p className="text-xs text-red-500">{(errors as Record<string, { message?: string }>).rating?.message}</p>
      )}

      {isOwner && (
        <>
          <Controller
            name={'accuracy_rating' as never}
            control={control as never}
            render={({ field }) => (
              <StarRating
                label="商品説明の正確さ *"
                value={(field as { value: number }).value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name={'response_rating' as never}
            control={control as never}
            render={({ field }) => (
              <StarRating
                label="対応の丁寧さ *"
                value={(field as { value: number }).value}
                onChange={field.onChange}
              />
            )}
          />
        </>
      )}

      {!isOwner && (
        <Controller
          name={'return_rating' as never}
          control={control as never}
          render={({ field }) => (
            <StarRating
              label="返却の丁寧さ *"
              value={(field as { value: number }).value}
              onChange={field.onChange}
            />
          )}
        />
      )}

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
