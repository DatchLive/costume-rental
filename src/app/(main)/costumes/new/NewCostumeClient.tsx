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
        size: data.size ?? null,
        price_per_day: data.price_per_day,
        images,
        area: data.area ?? null,
        ships_nationwide: data.ships_nationwide,
        min_rental_days: data.min_rental_days,
        max_rental_days: data.max_rental_days,
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
