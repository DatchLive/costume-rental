import { z } from 'zod'

const ratingField = z
  .number({ message: '評価を選択してください' })
  .int()
  .min(1, '1以上で評価してください')
  .max(5, '5以下で評価してください')

export const ownerReviewSchema = z.object({
  rating: ratingField,
  accuracy_rating: ratingField,
  response_rating: ratingField,
  comment: z.string().max(1000, '1000文字以内で入力してください').optional(),
})

export const renterReviewSchema = z.object({
  rating: ratingField,
  return_rating: ratingField,
  comment: z.string().max(1000, '1000文字以内で入力してください').optional(),
})

export type OwnerReviewFormData = z.infer<typeof ownerReviewSchema>
export type RenterReviewFormData = z.infer<typeof renterReviewSchema>
