import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MessageThread } from '@/components/message/MessageThread'
import { MessageInput } from '@/components/message/MessageInput'
import type { Message, Profile } from '@/types/database'

export const metadata: Metadata = { title: 'メッセージ' }

interface MessagePageProps {
  params: Promise<{ rentalId: string }>
}

export default async function MessagePage({ params }: MessagePageProps) {
  const { rentalId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/messages/${rentalId}`)

  const { data: rental } = await supabase
    .from('rentals')
    .select(`
      id, status,
      renter_id, owner_id,
      costumes(id, title),
      renter:profiles!rentals_renter_id_fkey(id, name, avatar_url),
      owner:profiles!rentals_owner_id_fkey(id, name, avatar_url)
    `)
    .eq('id', rentalId)
    .single()

  if (!rental) notFound()
  if (rental.renter_id !== user.id && rental.owner_id !== user.id) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('rental_id', rentalId)
    .order('created_at', { ascending: true })

  // Mark messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('rental_id', rentalId)
    .neq('sender_id', user.id)

  const renter = (rental as unknown as { renter: Pick<Profile, 'id' | 'name' | 'avatar_url'> }).renter
  const owner = (rental as unknown as { owner: Pick<Profile, 'id' | 'name' | 'avatar_url'> }).owner
  const costume = (rental as unknown as { costumes: { id: string; title: string } }).costumes

  const participants: Record<string, Pick<Profile, 'id' | 'name' | 'avatar_url'>> = {
    [renter.id]: renter,
    [owner.id]: owner,
  }

  const otherUser = user.id === rental.renter_id ? owner : renter

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <Link href="/messages" className="rounded-lg p-1 text-gray-600 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">
            {otherUser.name ?? '名前未設定'}
          </p>
          <Link
            href={`/rentals/${rentalId}`}
            className="truncate text-xs text-amber-700 hover:underline"
          >
            {costume?.title ?? '取引詳細'}
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
        <MessageThread
          rentalId={rentalId}
          currentUserId={user.id}
          initialMessages={(messages ?? []) as Message[]}
          participants={participants}
        />
      </div>

      {/* Input */}
      <MessageInput rentalId={rentalId} senderId={user.id} />
    </div>
  )
}
