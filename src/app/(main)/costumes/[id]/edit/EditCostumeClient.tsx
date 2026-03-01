'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CostumeForm } from '@/components/costume/CostumeForm'
import type { CostumeFormData } from '@/lib/validations/costume'
import type { CostumeCategory } from '@/types/database'

interface EditCostumeClientProps {
  costumeId: string
  userId: string
  maxImages: number
  defaultValues: Partial<CostumeFormData>
  initialImages: string[]
}

export function EditCostumeClient({
  costumeId,
  userId,
  maxImages,
  defaultValues,
  initialImages,
}: EditCostumeClientProps) {
  const router = useRouter()

  async function handleSubmit(data: CostumeFormData, images: string[]) {
    const supabase = createClient()
    const { error } = await supabase
      .from('costumes')
      .update({
        title: data.title,
        description: data.description ?? null,
        category: data.category as CostumeCategory,
        height_min: data.height_min ?? null,
        height_max: data.height_max ?? null,
        rental_price: data.rental_price,
        student_price: data.student_price ?? null,
        images,
        area: data.area ?? null,
        ships_nationwide: data.ships_nationwide,
        allows_handover: data.allows_handover,
        certan_ok: data.certan_ok,
        body_foundation_ok: data.body_foundation_ok,
        colors: data.colors ?? [],
      })
      .eq('id', costumeId)

    if (error) throw error
    router.push(`/costumes/${costumeId}`)
  }

  return (
    <CostumeForm
      userId={userId}
      defaultValues={defaultValues}
      initialImages={initialImages}
      maxImages={maxImages}
      onSubmit={handleSubmit}
      submitLabel="更新する"
    />
  )
}
