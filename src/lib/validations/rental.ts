import { z } from 'zod'

export const rentalRequestSchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'),
    message: z.string().max(500, '500文字以内で入力してください').optional(),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: '終了日は開始日より後にしてください',
    path: ['end_date'],
  })
  .refine((data) => data.start_date >= new Date().toISOString().slice(0, 10), {
    message: '開始日は本日以降で設定してください',
    path: ['start_date'],
  })

export type RentalRequestFormData = z.infer<typeof rentalRequestSchema>

export const cancelRentalSchema = z.object({
  cancel_reason: z.string().max(500, '500文字以内で入力してください').optional(),
})

export type CancelRentalFormData = z.infer<typeof cancelRentalSchema>
