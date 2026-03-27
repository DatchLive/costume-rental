'use client'

import { CostumeCard } from '@/components/costume/CostumeCard'
import { MessageBubble } from '@/components/message/MessageBubble'
import { RentalRequestForm } from '@/components/rental/RentalRequestForm'
import { RentalActionButtons } from '@/components/rental/RentalActionButtons'
import { RentalStatusBadge } from '@/components/rental/RentalStatusBadge'
import { ReviewForm } from '@/components/review/ReviewForm'
import type { CostumeWithProfile, Message, Profile } from '@/types/database'

// ── ダミーデータ ──────────────────────────────────────────

const DEMO_OWNER: Pick<Profile, 'id' | 'name' | 'avatar_url'> = {
  id: 'owner-demo',
  name: '田中さん（出品者）',
  avatar_url: null,
}

const DEMO_RENTER: Pick<Profile, 'id' | 'name' | 'avatar_url'> = {
  id: 'renter-demo',
  name: '山田さん（借り手）',
  avatar_url: null,
}

const BASE_PROFILES = {
  id: 'owner-demo',
  name: '田中さん',
  avatar_url: null,
  good_count: 12,
  total_count: 13,
  is_verified: false,
}

const DEMO_COSTUME_1: CostumeWithProfile = {
  id: 'demo-1',
  user_id: 'owner-demo',
  title: 'レッドラテンドレス',
  description: null,
  category: 'ラテン（女性）',
  height_min: 155,
  height_max: 165,
  rental_price: 3000,
  student_price: null,
  colors: ['レッド'],
  images: [],
  area: '東京',
  handover_area: null,
  ships_nationwide: true,
  allows_handover: true,
  cleaning_responsibility: 'renter_home',
  cleaning_notes: null,
  tanning_policy: 'none',
  safety_pin: false,
  perfume: false,
  status: 'available',
  created_at: '2024-01-01T00:00:00Z',
  profiles: BASE_PROFILES,
}

const DEMO_COSTUME_2: CostumeWithProfile = {
  ...DEMO_COSTUME_1,
  id: 'demo-2',
  title: 'ブラックスタンダードドレス',
  category: 'スタンダード（女性）',
  height_min: 160,
  height_max: 170,
  rental_price: 4500,
  colors: ['ブラック'],
  area: '大阪',
  allows_handover: false,
  profiles: { ...BASE_PROFILES, id: 'owner-demo-2', name: '鈴木さん' },
}

const DEMO_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    rental_id: 'rental-demo',
    sender_id: 'owner-demo',
    content: '申請ありがとうございます！受け渡し方法はご希望がありますか？',
    is_read: true,
    created_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'msg-2',
    rental_id: 'rental-demo',
    sender_id: 'renter-demo',
    content: '発送でお願いします。着払いは可能でしょうか？',
    is_read: true,
    created_at: '2024-06-01T10:30:00Z',
  },
  {
    id: 'msg-3',
    rental_id: 'rental-demo',
    sender_id: 'owner-demo',
    content: 'はい、着払いで大丈夫です。住所を教えていただけますか？',
    is_read: false,
    created_at: '2024-06-01T11:00:00Z',
  },
]

// ── 共通ラッパー ──────────────────────────────────────────

function PreviewFrame({
  children,
  center = false,
}: {
  children: React.ReactNode
  center?: boolean
}) {
  return (
    <div
      className={`pointer-events-none select-none h-full w-full overflow-hidden bg-gray-50 p-4 ${center ? 'flex flex-col items-center justify-center gap-4' : ''}`}
    >
      {children}
    </div>
  )
}

// ── 借りる人向け ──────────────────────────────────────────

/** ステップ 2: 衣装を探す — 検索結果の衣装カード */
export function SearchPreview() {
  return (
    <PreviewFrame>
      <div className="grid grid-cols-2 gap-3">
        <CostumeCard costume={DEMO_COSTUME_1} />
        <CostumeCard costume={DEMO_COSTUME_2} />
      </div>
    </PreviewFrame>
  )
}

/** ステップ 4: 申請する — レンタル申請フォーム */
export function ApplyPreview() {
  return (
    <PreviewFrame>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <RentalRequestForm
          rentalPrice={3000}
          shipsNationwide={true}
          allowsHandover={true}
          onSubmit={async () => {}}
        />
      </div>
    </PreviewFrame>
  )
}

/** ステップ 5 / 出品者ステップ 4: メッセージ — チャット画面 */
export function MessagePreview() {
  return (
    <PreviewFrame>
      <div className="flex flex-col gap-4">
        {DEMO_MESSAGES.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            sender={msg.sender_id === 'owner-demo' ? DEMO_OWNER : DEMO_RENTER}
            isOwn={msg.sender_id === 'renter-demo'}
          />
        ))}
      </div>
    </PreviewFrame>
  )
}

/** ステップ 6: 受け取る — 使用中ステータス */
export function ActiveStatusPreview() {
  return (
    <PreviewFrame center>
      <RentalStatusBadge status="active" />
      <p className="text-sm text-gray-500">出品者が発送済みにすると「使用中」に変わります</p>
    </PreviewFrame>
  )
}

/** ステップ 7: 返却する — 返却ボタン */
export function ReturnButtonPreview() {
  return (
    <PreviewFrame center>
      <RentalStatusBadge status="active" />
      <RentalActionButtons
        rentalId="demo-id"
        status="active"
        isOwner={false}
        isRenter={true}
      />
    </PreviewFrame>
  )
}

/** ステップ 8: 評価（借り手） */
export function ReviewPreviewRenter() {
  return (
    <div className="pointer-events-none select-none h-full w-full overflow-y-auto bg-white p-5">
      <ReviewForm role="renter" onSubmit={async () => {}} />
    </div>
  )
}

// ── 貸す人向け ────────────────────────────────────────────

/** ステップ 2: 衣装を登録する — 登録結果のカード */
export function RegisteredCostumePreview() {
  return (
    <PreviewFrame>
      <div className="mx-auto max-w-[200px]">
        <CostumeCard costume={DEMO_COSTUME_1} />
      </div>
    </PreviewFrame>
  )
}

/** ステップ 3: 申請を確認する — 承認・却下ボタン */
export function ApprovalPreview() {
  return (
    <PreviewFrame center>
      <RentalStatusBadge status="pending" />
      <RentalActionButtons
        rentalId="demo-id"
        status="pending"
        isOwner={true}
        isRenter={false}
      />
    </PreviewFrame>
  )
}

/** ステップ 5: 発送する — 発送済みボタン */
export function ShipPreview() {
  return (
    <PreviewFrame center>
      <RentalStatusBadge status="approved" />
      <RentalActionButtons
        rentalId="demo-id"
        status="approved"
        isOwner={true}
        isRenter={false}
      />
    </PreviewFrame>
  )
}

/** ステップ 6: 返却を受け取る — 受け取りボタン */
export function ReturnConfirmPreview() {
  return (
    <PreviewFrame center>
      <RentalStatusBadge status="returning" />
      <RentalActionButtons
        rentalId="demo-id"
        status="returning"
        isOwner={true}
        isRenter={false}
      />
    </PreviewFrame>
  )
}

/** ステップ 7: 準備完了 — 返却完了ステータス */
export function ReturnedStatusPreview() {
  return (
    <PreviewFrame center>
      <RentalStatusBadge status="returned" />
      <p className="text-sm text-gray-500">クリーニング・準備が完了したら衣装を貸し出し可能に戻します</p>
    </PreviewFrame>
  )
}

/** ステップ 8: 評価（出品者） */
export function ReviewPreviewOwner() {
  return (
    <div className="pointer-events-none select-none h-full w-full overflow-y-auto bg-white p-5">
      <ReviewForm role="owner" onSubmit={async () => {}} />
    </div>
  )
}
