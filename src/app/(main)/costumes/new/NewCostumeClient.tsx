'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CostumeForm } from '@/components/costume/CostumeForm'
import type { CostumeFormData } from '@/lib/validations/costume'
import type { CostumeCategory } from '@/types/database'

interface NewCostumeClientProps {
  userId: string
  maxImages: number
}

export function NewCostumeClient({ userId, maxImages }: NewCostumeClientProps) {
  const router = useRouter()

  async function handleSubmit(data: CostumeFormData, images: string[]) {
    const supabase = createClient()
    const { data: costume, error } = await supabase
      .from('costumes')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description ?? null,
        category: data.category as CostumeCategory,
        height_min: data.height_min ?? null,
        height_max: data.height_max ?? null,
        rental_price: data.rental_price,
        images,
        area: data.area ?? null,
        ships_nationwide: data.ships_nationwide,
        allows_handover: data.allows_handover,
        certan_ok: data.certan_ok,
        body_foundation_ok: data.body_foundation_ok,
        status: 'available',
      })
      .select('id')
      .single()

    if (error) throw error
    router.push(`/costumes/${costume.id}`)
  }

  return (
    <CostumeForm
      userId={userId}
      maxImages={maxImages}
      onSubmit={handleSubmit}
      submitLabel="出品する"
    />
  )
}
