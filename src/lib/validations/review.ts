import { z } from 'zod'

const ratingField = z.enum(['good', 'bad'], { message: '評価を選択してください' })

export const ownerReviewSchema = z.object({
  rating: ratingField,
  tags: z.array(z.string()),
  comment: z.string().max(1000, '1000文字以内で入力してください').optional(),
})

export const renterReviewSchema = z.object({
  rating: ratingField,
  tags: z.array(z.string()),
  comment: z.string().max(1000, '1000文字以内で入力してください').optional(),
})

export type OwnerReviewFormData = z.infer<typeof ownerReviewSchema>
export type RenterReviewFormData = z.infer<typeof renterReviewSchema>
