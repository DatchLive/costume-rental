import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'
import { ProfileEditClient } from './ProfileEditClient'

export const metadata: Metadata = { title: 'プロフィール設定' }

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile/edit')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">プロフィール設定</h1>
      <Card>
        <CardContent className="pt-6">
          <ProfileEditClient
            userId={user.id}
            initialValues={{
              name: profile?.name ?? '',
              area: profile?.area ?? '',
              bio: profile?.bio ?? '',
            }}
            initialAvatarUrl={profile?.avatar_url ?? null}
          />
        </CardContent>
      </Card>
    </div>
  )
}
