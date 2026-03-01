import { z } from 'zod'
import { COSTUME_CATEGORIES, COSTUME_COLORS, JAPAN_PREFECTURES } from '@/lib/constants'

const heightField = z
  .number({ message: '数値を入力してください' })
  .int('整数を入力してください')
  .min(50, '50cm以上で入力してください')
  .max(250, '250cm以下で入力してください')
  .optional()

export const costumeSchema = z.object({
  title: z.string().min(1, '必須項目です').max(100, '100文字以内で入力してください'),
  description: z.string().max(2000, '2000文字以内で入力してください').optional(),
  category: z.enum(COSTUME_CATEGORIES as [string, ...string[]], {
    message: 'カテゴリを選択してください',
  }),
  height_min: heightField,
  height_max: heightField,
  rental_price: z
    .number({ message: '数値を入力してください' })
    .int('整数を入力してください')
    .min(100, '100円以上で設定してください')
    .max(100000, '100,000円以下で設定してください'),
  student_price: z
    .number({ message: '数値を入力してください' })
    .int('整数を入力してください')
    .min(0, '0円以上で設定してください')
    .max(100000, '100,000円以下で設定してください')
    .optional(),
  area: z
    .enum([...JAPAN_PREFECTURES, ''] as [string, ...string[]])
    .optional(),
  ships_nationwide: z.boolean(),
  allows_handover: z.boolean(),
  certan_ok: z.boolean(),
  body_foundation_ok: z.boolean(),
  colors: z.array(z.enum([...COSTUME_COLORS] as [string, ...string[]])).max(2, { message: 'カラーは2つまで選択できます' }).optional(),
}).refine(
  (data) => !(data.height_min && data.height_max) || data.height_max >= data.height_min,
  { message: '最高身長は最低身長以上に設定してください', path: ['height_max'] }
)

export type CostumeFormData = z.infer<typeof costumeSchema>
