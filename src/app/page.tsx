import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CostumeGrid } from '@/components/costume/CostumeGrid'
import { CostumeFilter } from '@/components/costume/CostumeFilter'
import { Spinner } from '@/components/ui/Spinner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { CostumeWithProfile } from '@/types/database'

const PAGE_SIZE = 20

interface HomePageProps {
  searchParams: Promise<{
    category?: string
    height?: string
    area?: string
    min_price?: string
    max_price?: string
    ships_nationwide?: string
    allows_handover?: string
    handover_area?: string
    color?: string
    page?: string
  }>
}

async function CostumeList({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  let query = supabase
    .from('costumes')
    .select('*, profiles(id, name, avatar_url, good_count, total_count, is_verified)')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.category) query = query.eq('category', params.category)
  if (params.height) {
    const h = Number(params.height)
    query = query
      .or(`height_min.is.null,height_min.lte.${h}`)
      .or(`height_max.is.null,height_max.gte.${h}`)
  }
  if (params.area) {
    query =
      params.ships_nationwide === 'true'
        ? query.or(`area.eq.${params.area},ships_nationwide.eq.true`)
        : query.eq('area', params.area)
  }
  if (params.ships_nationwide === 'true' && !params.area) {
    query = query.eq('ships_nationwide', true)
  }
  if (params.allows_handover === 'true') {
    query = query.eq('allows_handover', true)
  }
  if (params.handover_area) {
    query = query.ilike('handover_area', `%${params.handover_area}%`)
  }
  if (params.min_price) query = query.gte('rental_price', Number(params.min_price))
  if (params.max_price) query = query.lte('rental_price', Number(params.max_price))
  if (params.color) query = query.contains('colors', [params.color])

  const [{ data: costumes }, { data: favoritesData }] = await Promise.all([
    query,
    userId
      ? supabase.from('favorites').select('costume_id').eq('user_id', userId)
      : Promise.resolve({ data: [] }),
  ])

  const typedCostumes = (costumes ?? []) as unknown as CostumeWithProfile[]
  const favoritedIds = new Set(
    (favoritesData ?? []).map((f) => (f as { costume_id: string }).costume_id),
  )

  return (
    <div>
      <div className="mb-4 text-sm text-gray-500">
        {typedCostumes.length > 0 ? `${typedCostumes.length}件の衣装が見つかりました` : ''}
      </div>
      <CostumeGrid costumes={typedCostumes} favoritedIds={favoritedIds} userId={userId} />
      {typedCostumes.length === PAGE_SIZE && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/?page=${page + 1}`}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            次のページ
          </Link>
        </div>
      )}
    </div>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-amber-50 to-stone-50 py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              社交ダンス衣装を
              <br className="sm:hidden" />
              レンタルしよう
            </h1>
            <p className="mt-3 text-gray-600 sm:text-lg">
              社交ダンスの衣装を、もっと気軽にレンタル
            </p>
            <Link
              href="/costumes/new"
              className="mt-6 inline-block rounded-lg bg-amber-700 px-6 py-3 text-sm font-medium text-white hover:bg-amber-800"
            >
              衣装を出品する
            </Link>
          </div>
        </section>

        {/* Filter + List */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-col items-center">
            <Suspense fallback={null}>
              <CostumeFilter />
            </Suspense>
          </div>
          <Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            }
          >
            <CostumeList searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  )
}
