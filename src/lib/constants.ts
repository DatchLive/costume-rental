import type { CostumeCategory } from '@/types/database'

export const COSTUME_CATEGORIES: CostumeCategory[] = [
  'ラテン（女性）',
  'ラテン（男性）',
  'スタンダード（女性）',
  'スタンダード（男性）',
  '練習着',
  'アクセサリー・小物',
  'その他',
]

export const JAPAN_PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
] as const


export const RENTAL_STATUS_LABELS: Record<string, string> = {
  pending: '申請中',
  approved: '承認済み',
  rejected: '却下',
  active: 'レンタル中',
  returned: '返却完了',
  cancelled: 'キャンセル',
}

export const RENTAL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  returned: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

// Free plan limits
export const FREE_PLAN_MAX_COSTUMES = 3
export const FREE_PLAN_MAX_IMAGES = 3
export const PREMIUM_PLAN_MAX_IMAGES = 10

// Rental constraints
export const MIN_RENTAL_DAYS = 2
export const MAX_RENTAL_DAYS = 14

// Cancel policy (days before start_date -> fee percentage)
export const CANCEL_POLICY = [
  { daysBeforeStart: 7, feePercent: 0 },
  { daysBeforeStart: 3, feePercent: 30 },
  { daysBeforeStart: 1, feePercent: 50 },
  { daysBeforeStart: 0, feePercent: 100 },
] as const
