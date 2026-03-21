import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { CostumeGrid } from '@/components/costume/CostumeGrid'
import { ReviewCard } from '@/components/review/ReviewCard'
import type { CostumeWithProfile, Review, Profile } from '@/types/database'

interface UserPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('name').eq('id', id).single()
  return { title: data?.name ?? 'ユーザープロフィール' }
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()

  if (!profile) notFound()

  const [{ data: costumes }, { data: reviews }] = await Promise.all([
    supabase
      .from('costumes')
      .select('*, profiles(id, name, avatar_url, good_count, total_count, is_verified)')
      .eq('user_id', id)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, name, avatar_url)')
      .eq('reviewee_id', id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Profile header */}
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar src={profile.avatar_url} name={profile.name} size="xl" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name ?? '名前未設定'}</h1>
            {profile.is_verified && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                ✓ 認定ユーザー
              </span>
            )}
          </div>
          {profile.area && (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {profile.area}
            </p>
          )}
          {(profile.total_count ?? 0) > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              👍 良かった {profile.good_count}件 / {profile.total_count}件
            </p>
          )}
          {profile.bio && <p className="mt-3 max-w-lg text-sm text-gray-600">{profile.bio}</p>}
        </div>
      </div>

      {/* Costumes */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">出品中の衣装</h2>
        <CostumeGrid
          costumes={(costumes ?? []) as unknown as CostumeWithProfile[]}
          emptyMessage="現在出品中の衣装はありません"
        />
      </section>

      {/* Reviews */}
      {(reviews?.length ?? 0) > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">評価・レビュー</h2>
          <div className="flex flex-col gap-3">
            {reviews!.map((review) => (
              <ReviewCard
                key={review.id}
                review={
                  review as unknown as Review & {
                    reviewer: Pick<Profile, 'id' | 'name' | 'avatar_url'>
                  }
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
