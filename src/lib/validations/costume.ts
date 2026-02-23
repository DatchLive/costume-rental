import { z } from 'zod'
import { COSTUME_CATEGORIES, COSTUME_SIZES, JAPAN_PREFECTURES } from '@/lib/constants'

export const costumeSchema = z.object({
  title: z.string().min(1, '必須項目です').max(100, '100文字以内で入力してください'),
  description: z.string().max(2000, '2000文字以内で入力してください').optional(),
  category: z.enum(COSTUME_CATEGORIES as [string, ...string[]], {
    message: 'カテゴリを選択してください',
  }),
  size: z
    .enum([...COSTUME_SIZES, ''] as [string, ...string[]])
    .optional(),
  price_per_day: z
    .number({ message: '数値を入力してください' })
    .int('整数を入力してください')
    .min(100, '100円以上で設定してください')
    .max(100000, '100,000円以下で設定してください'),
  area: z
    .enum([...JAPAN_PREFECTURES, ''] as [string, ...string[]])
    .optional(),
  ships_nationwide: z.boolean(),
  min_rental_days: z
    .number({ message: '数値を入力してください' })
    .int()
    .min(2, '最短2日から設定できます')
    .max(14, '最長14日まで設定できます'),
  max_rental_days: z
    .number({ message: '数値を入力してください' })
    .int()
    .min(2, '最短2日から設定できます')
    .max(30, '最長30日まで設定できます'),
}).refine((data) => data.max_rental_days >= data.min_rental_days, {
  message: '最長レンタル日数は最短以上に設定してください',
  path: ['max_rental_days'],
})

export type CostumeFormData = z.infer<typeof costumeSchema>
