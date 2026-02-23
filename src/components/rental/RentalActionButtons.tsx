'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
interface RentalActionButtonsProps {
  rentalId: string
  costumeId: string
  status: string
  isOwner: boolean
  isRenter: boolean
}

export function RentalActionButtons({
  rentalId,
  costumeId,
  status,
  isOwner,
  isRenter,
}: RentalActionButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  async function updateStatus(newStatus: string) {
    setLoading(newStatus)
    const supabase = createClient()
    await supabase
      .from('rentals')
      .update({ status: newStatus })
      .eq('id', rentalId)

    // Notify via API
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: `rental_${newStatus}`, rentalId }),
    })

    // Update costume status if active/returned
    if (newStatus === 'approved') {
      await supabase.from('costumes').update({ status: 'renting' }).eq('id', costumeId)
    } else if (newStatus === 'returned' || newStatus === 'rejected' || newStatus === 'cancelled') {
      await supabase.from('costumes').update({ status: 'available' }).eq('id', costumeId)
    }

    setLoading(null)
    router.refresh()
  }

  async function handleCancel() {
    setLoading('cancelled')
    const supabase = createClient()
    await supabase
      .from('rentals')
      .update({ status: 'cancelled', cancel_reason: cancelReason || null })
      .eq('id', rentalId)

    await supabase.from('costumes').update({ status: 'available' }).eq('id', costumeId)
    setCancelModalOpen(false)
    setLoading(null)
    router.refresh()
  }

  if (status === 'rejected' || status === 'cancelled' || status === 'returned') {
    return null
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {isOwner && status === 'pending' && (
          <>
            <Button
              onClick={() => updateStatus('approved')}
              loading={loading === 'approved'}
            >
              承認する
            </Button>
            <Button
              variant="danger"
              onClick={() => updateStatus('rejected')}
              loading={loading === 'rejected'}
            >
              却下する
            </Button>
          </>
        )}

        {isOwner && status === 'approved' && (
          <Button
            onClick={() => updateStatus('active')}
            loading={loading === 'active'}
          >
            発送済みにする
          </Button>
        )}

        {isOwner && status === 'active' && (
          <Button
            onClick={() => updateStatus('returned')}
            loading={loading === 'returned'}
          >
            返却完了
          </Button>
        )}

        {isRenter && status === 'pending' && (
          <Button
            variant="danger"
            onClick={() => setCancelModalOpen(true)}
          >
            申請をキャンセル
          </Button>
        )}

        {(isRenter || isOwner) && (status === 'approved' || status === 'active') && (
          <Button
            variant="danger"
            onClick={() => setCancelModalOpen(true)}
          >
            キャンセルする
          </Button>
        )}
      </div>

      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="キャンセルの確認"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            本当にキャンセルしますか？キャンセルポリシーに基づいてキャンセル料が発生する場合があります。
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">キャンセル理由（任意）</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              戻る
            </Button>
            <Button
              variant="danger"
              loading={loading === 'cancelled'}
              onClick={handleCancel}
            >
              キャンセルする
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
