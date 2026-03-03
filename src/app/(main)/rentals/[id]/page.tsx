import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RentalStatusBadge } from '@/components/rental/RentalStatusBadge'
import { RentalActionButtons } from '@/components/rental/RentalActionButtons'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatDate, formatPrice } from '@/lib/utils'
import type { RentalStatus } from '@/types/database'

export const metadata: Metadata = { title: '取引詳細' }

interface RentalDetailPageProps {
  params: Promise<{ id: string }>
}

const STATUS_GUIDE: Record<string, { renter: string; owner: string }> = {
  pending:   { renter: '承認をお待ちください',                        owner: '申請を確認して承認・却下してください' },
  approved:  { renter: '受け渡し方法をメッセージで確認してください',   owner: '受け渡し方法をメッセージで確認してください' },
  active:    { renter: '返却の準備ができたら返却報告してください',       owner: '返却をお待ちください' },
  returning: { renter: 'オーナーの受取確認をお待ちください',            owner: '返却を受け取ったら確認してください' },
  returned:  { renter: '評価を投稿してください',                        owner: 'クリーニング・準備が完了したら貸し出し可能にしてください' },
}

export default async function RentalDetailPage({ params }: RentalDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/rentals/${id}`)

  const { data: rental } = await supabase
    .from('rentals')
    .select(`
      *,
      costumes(id, title, images, rental_price, category),
      renter:profiles!rentals_renter_id_fkey(id, name, avatar_url),
      owner:profiles!rentals_owner_id_fkey(id, name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (!rental) notFound()
  if (rental.renter_id !== user.id && rental.owner_id !== user.id) notFound()

  const isOwner = user.id === rental.owner_id
  const isRenter = user.id === rental.renter_id
  const costume = (rental as unknown as { costumes: { id: string; title: string; images: string[]; rental_price: number; category: string } }).costumes
  const renter = (rental as unknown as { renter: { id: string; name: string | null; avatar_url: string | null } }).renter
  const owner = (rental as unknown as { owner: { id: string; name: string | null; avatar_url: string | null } }).owner

  const guide = STATUS_GUIDE[rental.status]
  const guideText = guide ? (isRenter ? guide.renter : guide.owner) : null

  // Check if user has already reviewed
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('rental_id', id)
    .eq('reviewer_id', user.id)
    .single()

  const canReview = rental.status === 'returned' && !existingReview

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">取引詳細</h1>
        <RentalStatusBadge status={rental.status as RentalStatus} />
      </div>

      <div className="flex flex-col gap-6">
        {/* Status guidance */}
        {guideText && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {guideText}
          </div>
        )}

        {/* Costume info */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {costume?.images?.[0] ? (
              <Image
                src={costume.images[0]}
                alt={costume.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : null}
          </div>
          <div>
            <Link
              href={`/costumes/${costume?.id}`}
              className="font-medium text-gray-900 hover:text-amber-700"
            >
              {costume?.title ?? '（削除された衣装）'}
            </Link>
          </div>
        </div>

        {/* Rental details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">取引内容</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">使用日</dt>
              <dd className="font-medium text-gray-900">{formatDate(rental.use_date)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">レンタル料金</dt>
              <dd className="text-gray-900">{formatPrice(costume?.rental_price ?? 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <dt className="font-medium text-gray-700">合計金額</dt>
              <dd className="text-xl font-bold text-amber-700">{formatPrice(rental.total_price)}</dd>
            </div>
          </dl>
        </div>

        {/* Participants */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">取引相手</h2>
          <div className="flex items-center gap-3">
            {isRenter ? (
              <>
                <Avatar src={owner.avatar_url} name={owner.name} size="md" />
                <div>
                  <p className="text-xs text-gray-500">出品者</p>
                  <Link href={`/users/${owner.id}`} className="font-medium text-gray-900 hover:text-amber-700">
                    {owner.name ?? '名前未設定'}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Avatar src={renter.avatar_url} name={renter.name} size="md" />
                <div>
                  <p className="text-xs text-gray-500">借り手</p>
                  <Link href={`/users/${renter.id}`} className="font-medium text-gray-900 hover:text-amber-700">
                    {renter.name ?? '名前未設定'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <RentalActionButtons
          rentalId={id}
          costumeId={costume?.id ?? ''}
          status={rental.status as RentalStatus}
          isOwner={isOwner}
          isRenter={isRenter}
        />

        {/* Message link */}
        <Link href={`/messages/${id}`}>
          <Button variant="outline" className="w-full gap-2">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            メッセージを見る
          </Button>
        </Link>

        {/* Review link */}
        {canReview && (
          <Link href={`/rentals/${id}/review`}>
            <Button variant="secondary" className="w-full">
              評価を投稿する
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
