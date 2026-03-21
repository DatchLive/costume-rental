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

export const COSTUME_COLORS = [
  'レッド',
  'ピンク',
  'オレンジ',
  'イエロー',
  'グリーン',
  'ブルー',
  'ネイビー',
  'パープル',
  'ブラック',
  'ホワイト',
  'ゴールド',
  'シルバー',
  'ベージュ',
  'ブラウン',
  'マルチカラー',
] as const

export type CostumeColor = (typeof COSTUME_COLORS)[number]

// CSS color values for each costume color (use `background` shorthand to support gradients)
export const COSTUME_COLOR_MAP: Record<string, string> = {
  レッド: '#dc2626',
  ピンク: '#f472b6',
  オレンジ: '#f97316',
  イエロー: '#fbbf24',
  グリーン: '#22c55e',
  ブルー: '#3b82f6',
  ネイビー: '#1e3a8a',
  パープル: '#a855f7',
  ブラック: '#111827',
  ホワイト: '#f9fafb',
  ゴールド: '#d97706',
  シルバー: '#94a3b8',
  ベージュ: '#d4b896',
  ブラウン: '#7c3f1e',
  マルチカラー: 'conic-gradient(#dc2626, #f97316, #fbbf24, #22c55e, #3b82f6, #a855f7, #dc2626)',
}

export const CLEANING_RESPONSIBILITY_OPTIONS = [
  { value: 'renter_home', label: '借り手負担（ホームクリーニング可）' },
  { value: 'renter_shop', label: '借り手負担（クリーニング店）' },
  { value: 'owner', label: 'オーナー負担' },
  { value: 'other', label: 'その他' },
] as const

export type CleaningResponsibility = (typeof CLEANING_RESPONSIBILITY_OPTIONS)[number]['value']

export const CLEANING_RESPONSIBILITY_LABEL: Record<string, string> = {
  renter_home: '借り手負担（ホームクリーニング可）',
  renter_shop: '借り手負担（クリーニング店）',
  owner: 'オーナー負担',
  other: 'その他',
}

export const TANNING_POLICY_OPTIONS = [
  { value: 'none', label: 'すべて不可' },
  { value: 'self', label: 'セルタンのみ可' },
  { value: 'all', label: 'ボディファン・セルタン可' },
] as const

export type TanningPolicy = (typeof TANNING_POLICY_OPTIONS)[number]['value']

export const TANNING_POLICY_LABEL: Record<string, string> = {
  none: 'すべて不可',
  self: 'セルタンのみ可',
  all: 'ボディファン・セルタン可',
}

export const RENTAL_STATUS_LABELS: Record<string, string> = {
  pending: '申請中',
  approved: '承認済み',
  rejected: '却下',
  active: 'レンタル中',
  returning: '返却確認中',
  returned: '返却完了',
  completed: '取引完了',
  cancelled: 'キャンセル',
}

export const RENTAL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  returning: 'bg-orange-100 text-orange-800',
  returned: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

// Costume review labels
export const COSTUME_REVIEW_SIZE_FIT_OPTIONS = [
  { value: 'small', label: '小さかった' },
  { value: 'just', label: 'ちょうどよかった' },
  { value: 'large', label: '大きかった' },
] as const

export const COSTUME_REVIEW_PHOTO_MATCH_OPTIONS = [
  { value: 'same', label: '写真通り' },
  { value: 'slightly_different', label: '少し違った' },
] as const

export const COSTUME_REVIEW_CONDITION_OPTIONS = [
  { value: 'good', label: '良好' },
  { value: 'normal', label: '普通' },
] as const

export const COSTUME_REVIEW_SCENE_OPTIONS = [
  { value: 'competition', label: '競技会' },
  { value: 'party', label: 'パーティー' },
  { value: 'demo', label: 'デモンストレーション' },
] as const

export const COSTUME_REVIEW_SIZE_FIT_LABELS: Record<string, string> = {
  small: '小さかった',
  just: 'ちょうどよかった',
  large: '大きかった',
}

export const COSTUME_REVIEW_PHOTO_MATCH_LABELS: Record<string, string> = {
  same: '写真通り',
  slightly_different: '少し違った',
}

export const COSTUME_REVIEW_CONDITION_LABELS: Record<string, string> = {
  good: '良好',
  normal: '普通',
}

export const COSTUME_REVIEW_SCENE_LABELS: Record<string, string> = {
  competition: '競技会',
  party: 'パーティー',
  demo: 'デモンストレーション',
}

// Free plan limits
export const FREE_PLAN_MAX_COSTUMES = 3
export const FREE_PLAN_MAX_IMAGES = 3
export const PREMIUM_PLAN_MAX_IMAGES = 10

// Cancel policy (days before use_date -> fee percentage)
export const CANCEL_POLICY = [
  { daysBeforeStart: 7, feePercent: 0 },
  { daysBeforeStart: 3, feePercent: 30 },
  { daysBeforeStart: 1, feePercent: 50 },
  { daysBeforeStart: 0, feePercent: 100 },
] as const
