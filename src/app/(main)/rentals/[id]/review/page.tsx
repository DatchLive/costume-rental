import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReviewSubmitClient } from './ReviewSubmitClient'

export const metadata: Metadata = { title: '評価を投稿する' }

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/rentals/${id}/review`)

  const { data: rental } = await supabase
    .from('rentals')
    .select('id, status, renter_id, owner_id, costume_id')
    .eq('id', id)
    .single()

  if (!rental) notFound()
  if (rental.renter_id !== user.id && rental.owner_id !== user.id) notFound()
  if (rental.status !== 'returned') redirect(`/rentals/${id}`)

  // Check if already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('rental_id', id)
    .eq('reviewer_id', user.id)
    .single()

  if (existing) redirect(`/rentals/${id}`)

  const isOwner = user.id === rental.owner_id
  const revieweeId = isOwner ? rental.renter_id : rental.owner_id

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">評価を投稿する</h1>
      <p className="mb-6 text-sm text-gray-500">
        双方が評価を投稿するか、7日間経過すると公開されます。
      </p>
      <ReviewSubmitClient
        rentalId={id}
        reviewerId={user.id}
        revieweeId={revieweeId}
        role={isOwner ? 'owner' : 'renter'}
        costumeId={!isOwner ? rental.costume_id : undefined}
      />
    </div>
  )
}
