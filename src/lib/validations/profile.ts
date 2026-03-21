import { z } from 'zod'
import { JAPAN_PREFECTURES } from '@/lib/constants'

export const profileSchema = z.object({
  name: z.string().min(1, '必須項目です').max(50, '50文字以内で入力してください'),
  area: z.enum([...JAPAN_PREFECTURES, ''] as [string, ...string[]]).optional(),
  bio: z.string().max(500, '500文字以内で入力してください').optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
