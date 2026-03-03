import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
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
import type { CostumeWithProfile } from '@/types/database'

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

  const [{ data: costumeData }, { data: activeRental }] = await Promise.all([
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
  ])

  if (!costumeData) notFound()
  const isRenting = !!activeRental

  const costume = costumeData as unknown as CostumeWithProfile & {
    profiles: { id: string; name: string | null; avatar_url: string | null; good_count: number; total_count: number; is_verified: boolean; area: string | null }
  }

  if (costume.status === 'hidden') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== costume.user_id) notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === costume.user_id

  const images = costume.images.length > 0 ? costume.images : []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={costume.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {isRenting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Badge variant="warning" className="text-sm">レンタル中</Badge>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.slice(1).map((url, i) => (
                <div key={url} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={url}
                    alt={`${costume.title} ${i + 2}枚目`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <CategoryBadge category={costume.category} />
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
              ownerId={costume.user_id}
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
    </div>
  )
}
