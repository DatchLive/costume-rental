'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RentalRequestForm } from '@/components/rental/RentalRequestForm'
import type { RentalRequestFormData } from '@/lib/validations/rental'
import { calcTotalPrice } from '@/lib/utils'

interface RentalRequestFormWrapperProps {
  costumeId: string
  pricePerDay: number
  minDays: number
  maxDays: number
  ownerId: string
}

export function RentalRequestFormWrapper({
  costumeId,
  pricePerDay,
  minDays,
  maxDays,
  ownerId,
}: RentalRequestFormWrapperProps) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(data: RentalRequestFormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const totalPrice = calcTotalPrice(pricePerDay, data.start_date, data.end_date)

    const { data: rental, error } = await supabase
      .from('rentals')
      .insert({
        costume_id: costumeId,
        renter_id: user.id,
        owner_id: ownerId,
        start_date: data.start_date,
        end_date: data.end_date,
        total_price: totalPrice,
        platform_fee: 0,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error

    // Notify via API
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'rental_requested',
        rentalId: rental.id,
      }),
    })

    setSuccess(true)
    setTimeout(() => router.push(`/rentals/${rental.id}`), 1500)
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 p-4 text-center text-sm text-green-700">
        申請を送信しました。取引ページに移動します...
      </div>
    )
  }

  return (
    <RentalRequestForm
      pricePerDay={pricePerDay}
      minDays={minDays}
      maxDays={maxDays}
      onSubmit={handleSubmit}
    />
  )
}
