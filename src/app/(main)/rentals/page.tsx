import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RentalStatusBadge } from '@/components/rental/RentalStatusBadge'
import { formatDate, formatPrice } from '@/lib/utils'
import type { RentalWithDetails } from '@/types/database'

export const metadata: Metadata = { title: '取引一覧' }

const ACTIVE_STATUSES = ['pending', 'approved', 'active', 'returning', 'returned']
const HISTORY_STATUSES = ['completed', 'rejected', 'cancelled']

interface RentalsPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function RentalsPage({ searchParams }: RentalsPageProps) {
  const { tab } = await searchParams
  const isHistory = tab === 'history'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/rentals')

  const statuses = isHistory ? HISTORY_STATUSES : ACTIVE_STATUSES

  const { data: asRenter } = await supabase
    .from('rentals')
    .select(`
      *,
      costumes(id, title, images, rental_price),
      renter:profiles!rentals_renter_id_fkey(id, name, avatar_url),
      owner:profiles!rentals_owner_id_fkey(id, name, avatar_url)
    `)
    .eq('renter_id', user.id)
    .in('status', statuses)
    .order('created_at', { ascending: false })

  const { data: asOwner } = await supabase
    .from('rentals')
    .select(`
      *,
      costumes(id, title, images, rental_price),
      renter:profiles!rentals_renter_id_fkey(id, name, avatar_url),
      owner:profiles!rentals_owner_id_fkey(id, name, avatar_url)
    `)
    .eq('owner_id', user.id)
    .in('status', statuses)
    .order('created_at', { ascending: false })

  const renderList = (rentals: RentalWithDetails[] | null, emptyMessage: string) => {
    if (!rentals || rentals.length === 0) {
      return <p className="py-8 text-center text-sm text-gray-500">{emptyMessage}</p>
    }
    return (
      <div className="flex flex-col gap-3">
        {rentals.map((rental) => {
          const costume = (rental as unknown as { costumes: { id: string; title: string; images: string[]; rental_price: number } }).costumes
          return (
            <Link
              key={rental.id}
              href={`/rentals/${rental.id}`}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
            >
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {costume?.images?.[0] ? (
                  <Image
                    src={costume.images[0]}
                    alt={costume.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium text-gray-900">
                  {costume?.title ?? '（削除された衣装）'}
                </p>
                <p className="text-xs text-gray-500">
                  使用日: {formatDate(rental.use_date)}
                </p>
                <p className="text-sm font-medium text-amber-700">
                  {formatPrice(rental.total_price)}
                </p>
              </div>
              <RentalStatusBadge status={rental.status} />
            </Link>
          )
        })}
      </div>
    )
  }

  const renterEmpty = isHistory ? '過去の取引はありません' : '取引中の申請はありません'
  const ownerEmpty = isHistory ? '過去の取引はありません' : '取引中の申請はありません'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">取引一覧</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        <Link
          href="/rentals"
          className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors ${
            !isHistory ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          取引中
        </Link>
        <Link
          href="/rentals?tab=history"
          className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors ${
            isHistory ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          過去の取引
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">借りた衣装</h2>
        {renderList(asRenter as unknown as RentalWithDetails[], renterEmpty)}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-700">貸した衣装</h2>
        {renderList(asOwner as unknown as RentalWithDetails[], ownerEmpty)}
      </div>
    </div>
  )
}
