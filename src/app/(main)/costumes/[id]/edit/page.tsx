import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'
import { EditCostumeClient } from './EditCostumeClient'
import { FREE_PLAN_MAX_IMAGES, PREMIUM_PLAN_MAX_IMAGES } from '@/lib/constants'

export const metadata: Metadata = { title: '衣装を編集する' }

interface EditCostumePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCostumePage({ params }: EditCostumePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/costumes/${id}/edit`)

  const { data: costume } = await supabase
    .from('costumes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!costume) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const maxImages = profile?.plan === 'premium' ? PREMIUM_PLAN_MAX_IMAGES : FREE_PLAN_MAX_IMAGES

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">衣装を編集する</h1>
      <Card>
        <CardContent className="pt-6">
          <EditCostumeClient
            costumeId={id}
            userId={user.id}
            maxImages={maxImages}
            defaultValues={{
              title: costume.title,
              description: costume.description ?? undefined,
              category: costume.category as never,
              height_min: costume.height_min ?? undefined,
              height_max: costume.height_max ?? undefined,
              rental_price: costume.rental_price,
              student_price: costume.student_price ?? undefined,
              area: costume.area ?? undefined,
              ships_nationwide: costume.ships_nationwide,
              allows_handover: costume.allows_handover,
              handover_area: costume.handover_area ?? undefined,
              cleaning_responsibility: costume.cleaning_responsibility,
              cleaning_notes: costume.cleaning_notes ?? undefined,
              buffer_days: costume.buffer_days,
              tanning_policy: costume.tanning_policy,
              safety_pin: costume.safety_pin,
              perfume: costume.perfume,
              colors: costume.colors ?? [],
            }}
            initialImages={costume.images}
          />
        </CardContent>
      </Card>
    </div>
  )
}
