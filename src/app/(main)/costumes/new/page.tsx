import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { NewCostumeClient } from './NewCostumeClient'
import {
  FREE_PLAN_MAX_COSTUMES,
  FREE_PLAN_MAX_IMAGES,
  PREMIUM_PLAN_MAX_IMAGES,
} from '@/lib/constants'

export const metadata: Metadata = { title: '衣装を出品する' }

export default async function NewCostumePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/costumes/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.plan === 'premium'

  // Free plan: check listing count
  if (!isPremium) {
    const { count } = await supabase
      .from('costumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'hidden')

    if ((count ?? 0) >= FREE_PLAN_MAX_COSTUMES) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>出品数の上限に達しました</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                無料プランでは最大{FREE_PLAN_MAX_COSTUMES}点まで出品できます。
                追加で出品するにはプレミアムプランへのアップグレードが必要です。
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  const maxImages = isPremium ? PREMIUM_PLAN_MAX_IMAGES : FREE_PLAN_MAX_IMAGES

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">衣装を出品する</h1>
      <Card>
        <CardContent className="pt-6">
          <NewCostumeClient userId={user.id} maxImages={maxImages} />
        </CardContent>
      </Card>
    </div>
  )
}
