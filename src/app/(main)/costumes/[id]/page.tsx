import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, Truck, Handshake, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CategoryBadge } from '@/components/costume/CategoryBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import { CLEANING_RESPONSIBILITY_LABEL, TANNING_POLICY_LABEL } from '@/lib/constants'
import { RentalRequestFormWrapper } from './RentalRequestFormWrapper'
import { FavoriteButton } from '@/components/costume/FavoriteButton'
import { ImageGallery } from './ImageGallery'
import { CostumeReviewCard } from '@/components/review/CostumeReviewCard'
import type { CostumeWithProfile, CostumeReview, Profile } from '@/types/database'

interface CostumePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CostumePageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('costumes')
    .select('title, description')
    .eq('id', id)
    .single()

  return {
    title: data?.title ?? '衣装詳細',
    description: data?.description ?? undefined,
  }
}

export default async function CostumePage({ params }: CostumePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  const [{ data: costumeData }, { data: activeRental }, { data: favoriteRow }, { data: costumeReviewsData }] = await Promise.all([
    supabase
      .from('costumes')
      .select('*, profiles(id, name, avatar_url, good_count, total_count, is_verified, area)')
      .eq('id', id)
      .single(),
    supabase
      .from('rentals')
      .select('id')
      .eq('costume_id', id)
      .in('status', ['approved', 'active', 'returning'])
      .limit(1)
      .maybeSingle(),
    userId
      ? supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('costume_id', id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('costume_reviews')
      .select('*, reviewer:profiles!costume_reviews_reviewer_id_fkey(id, name, avatar_url)')
      .eq('costume_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!costumeData) notFound()
  const isRenting = !!activeRental
  const isFavorited = !!favoriteRow

  type CostumeReviewWithReviewer = CostumeReview & {
    reviewer: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  }
  const costumeReviews = (costumeReviewsData ?? []) as unknown as CostumeReviewWithReviewer[]

  const costume = costumeData as unknown as CostumeWithProfile & {
    profiles: { id: string; name: string | null; avatar_url: string | null; good_count: number; total_count: number; is_verified: boolean; area: string | null }
  }

  if (costume.status === 'hidden') {
    if (!user || user.id !== costume.user_id) notFound()
  }

  const isOwner = user?.id === costume.user_id

  const images = costume.images.length > 0 ? costume.images : []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <ImageGallery
          images={images}
          title={costume.title}
          isRenting={isRenting}
        />

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <CategoryBadge category={costume.category} />
              <FavoriteButton
                costumeId={id}
                userId={userId}
                isFavorited={isFavorited}
                size="md"
              />
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{costume.title}</h1>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-700">
                {formatPrice(costume.rental_price)}
              </span>
              {costume.student_price != null && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-700">
                  学生 {formatPrice(costume.student_price)}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {(costume.height_min || costume.height_max) && (
              <Badge variant="outline">
                対応身長: {costume.height_min ?? ''}〜{costume.height_max ?? ''}cm
              </Badge>
            )}
            {costume.area && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {costume.area}
              </span>
            )}
            {costume.ships_nationwide && (
              <span className="flex items-center gap-1 text-green-700">
                <Truck className="h-4 w-4" aria-hidden="true" />
                全国発送対応
              </span>
            )}
            {costume.allows_handover && (
              <span className="flex items-center gap-1 text-blue-700">
                <Handshake className="h-4 w-4" aria-hidden="true" />
                手渡し対応
                {costume.handover_area && (
                  <span className="text-gray-600">（{costume.handover_area}）</span>
                )}
              </span>
            )}
            {costume.tanning_policy !== 'none' && (
              <Badge variant="outline">
                {TANNING_POLICY_LABEL[costume.tanning_policy] ?? costume.tanning_policy}
              </Badge>
            )}
            {costume.safety_pin && (
              <Badge variant="outline">安全ピン可</Badge>
            )}
            {costume.perfume && (
              <Badge variant="outline">香水可</Badge>
            )}
          </div>

          {/* Description */}
          {costume.description && (
            <div>
              <h2 className="mb-1 text-sm font-medium text-gray-700">説明</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-600">{costume.description}</p>
            </div>
          )}

          {/* Cleaning */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h2 className="mb-2 text-sm font-medium text-gray-700">クリーニング</h2>
            <p className="text-sm text-gray-800">
              {CLEANING_RESPONSIBILITY_LABEL[costume.cleaning_responsibility] ?? costume.cleaning_responsibility}
            </p>
            {costume.cleaning_notes && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-500">{costume.cleaning_notes}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              返却後の準備日数：{costume.buffer_days}日
            </p>
          </div>

          {/* Owner */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-medium text-gray-700">出品者</h2>
            <Link
              href={`/users/${costume.profiles.id}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <Avatar
                src={costume.profiles.avatar_url}
                name={costume.profiles.name}
                size="lg"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {costume.profiles.name ?? '名前未設定'}
                  {costume.profiles.is_verified && (
                    <span className="ml-1 text-xs text-amber-700">✓認定</span>
                  )}
                </p>
                {costume.profiles.area && (
                  <p className="text-xs text-gray-500">{costume.profiles.area}</p>
                )}
                {(costume.profiles.total_count ?? 0) > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    👍 良かった {costume.profiles.good_count}件
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-3">
              <Link href={`/costumes/${id}/edit`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  編集する
                </Button>
              </Link>
            </div>
          ) : user && costume.status === 'available' ? (
            <RentalRequestFormWrapper
              costumeId={id}
              rentalPrice={costume.rental_price}
              studentPrice={costume.student_price}
              ownerId={costume.user_id}
              shipsNationwide={costume.ships_nationwide}
              allowsHandover={costume.allows_handover}
            />
          ) : !user ? (
            <Link href={`/login?next=/costumes/${id}`}>
              <Button size="lg" className="w-full">
                ログインしてレンタル申請
              </Button>
            </Link>
          ) : null}

          <p className="text-xs text-gray-400">
            出品日: {formatDate(costume.created_at)}
          </p>
        </div>
      </div>

      {/* Costume reviews */}
      {costumeReviews.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            借りた人の声
            <span className="ml-2 text-sm font-normal text-gray-400">({costumeReviews.length}件)</span>
          </h2>
          <div className="flex flex-col gap-4">
            {costumeReviews.map((review) => (
              <CostumeReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
