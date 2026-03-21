import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { NotificationsClient } from './NotificationsClient'

export const metadata: Metadata = { title: '通知' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/notifications')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">通知</h1>
      <NotificationsClient userId={user.id} initialNotifications={notifications ?? []} />
    </div>
  )
}
