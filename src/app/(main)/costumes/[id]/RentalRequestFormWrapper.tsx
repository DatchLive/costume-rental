'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RentalRequestForm } from '@/components/rental/RentalRequestForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { RentalRequestFormData } from '@/lib/validations/rental'
import { calcTotalPrice } from '@/lib/utils'

interface RentalRequestFormWrapperProps {
  costumeId: string
  rentalPrice: number
  ownerId: string
}

export function RentalRequestFormWrapper({
  costumeId,
  rentalPrice,
  ownerId,
}: RentalRequestFormWrapperProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(data: RentalRequestFormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const totalPrice = calcTotalPrice(rentalPrice)

    const { data: rental, error } = await supabase
      .from('rentals')
      .insert({
        costume_id: costumeId,
        renter_id: user.id,
        owner_id: ownerId,
        use_date: data.use_date,
        total_price: totalPrice,
        platform_fee: 0,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error

    // 申請メッセージがあれば messages テーブルにも保存
    if (data.message?.trim()) {
      await supabase.from('messages').insert({
        rental_id: rental.id,
        sender_id: user.id,
        content: data.message.trim(),
      })
    }

    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'rental_requested', rentalId: rental.id }),
    })

    setSuccess(true)
    setTimeout(() => router.push(`/rentals/${rental.id}`), 1500)
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setModalOpen(true)}>
        レンタルを申請する
      </Button>

      <Modal
        open={modalOpen}
        onClose={() => !success && setModalOpen(false)}
        title="レンタル申請"
      >
        {success ? (
          <div className="py-4 text-center text-sm text-green-700">
            申請を送信しました。取引ページに移動します...
          </div>
        ) : (
          <RentalRequestForm rentalPrice={rentalPrice} onSubmit={handleSubmit} />
        )}
      </Modal>
    </>
  )
}
