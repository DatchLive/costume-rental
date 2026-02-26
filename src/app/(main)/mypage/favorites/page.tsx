import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CostumeGrid } from '@/components/costume/CostumeGrid'
import type { CostumeWithProfile } from '@/types/database'

export const metadata: Metadata = { title: 'お気に入り' }

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/mypage/favorites')

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      costume_id,
      costumes(*, profiles(id, name, avatar_url, good_count, bad_count, is_verified))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const costumes = (favorites ?? [])
    .map((f) => (f as unknown as { costumes: CostumeWithProfile }).costumes)
    .filter(Boolean)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">お気に入り</h1>
      <CostumeGrid costumes={costumes} emptyMessage="お気に入りに追加した衣装はありません" />
    </div>
  )
}
