import { z } from 'zod'

export const rentalRequestSchema = z.object({
  use_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません')
    .refine((d) => d >= new Date().toISOString().slice(0, 10), {
      message: '使用日は本日以降で設定してください',
    }),
  price_type: z.enum(['regular', 'student']),
  message: z.string().max(500, '500文字以内で入力してください').optional(),
})

export type RentalRequestFormData = z.infer<typeof rentalRequestSchema>

export const cancelRentalSchema = z.object({
  cancel_reason: z.string().max(500, '500文字以内で入力してください').optional(),
})

export type CancelRentalFormData = z.infer<typeof cancelRentalSchema>
