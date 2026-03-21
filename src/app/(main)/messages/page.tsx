import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelativeTime, truncate } from '@/lib/utils'

export const metadata: Metadata = { title: 'メッセージ' }

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/messages')

  // Get all rentals the user participates in, with latest message
  const { data: rentals } = await supabase
    .from('rentals')
    .select(
      `
      id, status,
      renter_id, owner_id,
      costumes(id, title, images),
      renter:profiles!rentals_renter_id_fkey(id, name, avatar_url),
      owner:profiles!rentals_owner_id_fkey(id, name, avatar_url),
      messages(id, content, created_at, is_read, sender_id)
    `,
    )
    .or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Sort by latest message date
  const threadsWithLatestMessage = (rentals ?? [])
    .map((rental) => {
      const messages =
        (
          rental as unknown as {
            messages: {
              id: string
              content: string
              created_at: string
              is_read: boolean
              sender_id: string
            }[]
          }
        ).messages ?? []
      const sorted = [...messages].sort((a, b) => b.created_at.localeCompare(a.created_at))
      const latestMessage = sorted[0]
      const unreadCount = messages.filter((m) => !m.is_read && m.sender_id !== user.id).length
      return { ...rental, latestMessage, unreadCount }
    })
    .filter((r) => r.latestMessage) // Only show threads with messages
    .sort((a, b) => b.latestMessage!.created_at.localeCompare(a.latestMessage!.created_at))

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">メッセージ</h1>

      {threadsWithLatestMessage.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <p>まだメッセージはありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {threadsWithLatestMessage.map((thread) => {
            const renter = (
              thread as unknown as {
                renter: { id: string; name: string | null; avatar_url: string | null }
              }
            ).renter
            const owner = (
              thread as unknown as {
                owner: { id: string; name: string | null; avatar_url: string | null }
              }
            ).owner
            const costume = (
              thread as unknown as { costumes: { id: string; title: string; images: string[] } }
            ).costumes
            const otherUser = user.id === thread.renter_id ? owner : renter

            return (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className={`flex items-center gap-3 rounded-xl border bg-white p-4 hover:bg-gray-50 ${
                  thread.unreadCount > 0 ? 'border-amber-200' : 'border-gray-200'
                }`}
              >
                <Avatar src={otherUser.avatar_url} name={otherUser.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-gray-900">
                      {otherUser.name ?? '名前未設定'}
                    </p>
                    {thread.latestMessage && (
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatRelativeTime(thread.latestMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-gray-500">{costume?.title ?? '取引'}</p>
                  {thread.latestMessage && (
                    <p
                      className={`truncate text-sm ${thread.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                    >
                      {truncate(thread.latestMessage.content, 40)}
                    </p>
                  )}
                </div>
                {thread.unreadCount > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {thread.unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
