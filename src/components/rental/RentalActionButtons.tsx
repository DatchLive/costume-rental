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

type ConfirmAction = {
  newStatus: string
  title: string
  message: string
  label: string
}

const CONFIRM_ACTIONS: Record<string, ConfirmAction> = {
  approved: {
    newStatus: 'approved',
    title: '申請を承認しますか？',
    message: '承認すると借り手に通知されます。メッセージで受け渡し方法などを確認してください。',
    label: '承認する',
  },
  active: {
    newStatus: 'active',
    title: '発送済みにしますか？',
    message: '衣装を発送・手渡し済みの場合に押してください。借り手に通知されます。',
    label: '発送済みにする',
  },
  returning: {
    newStatus: 'returning',
    title: '返却しましたか？',
    message: '衣装を返送・手渡し済みの場合に押してください。出品者に通知されます。',
    label: '返却しました',
  },
  returned: {
    newStatus: 'returned',
    title: '受け取りを確認しますか？',
    message: '衣装を受け取った場合に押してください。取引が完了に向けて進みます。',
    label: '受け取りました',
  },
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
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState(false)

  async function updateStatus(newStatus: string) {
    setLoading(newStatus)
    setConfirmAction(null)
    const supabase = createClient()
    await supabase
      .from('rentals')
      .update({ status: newStatus })
      .eq('id', rentalId)

    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: `rental_${newStatus}`, rentalId }),
    })

    setLoading(null)
    router.refresh()
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setRejectError(true)
      return
    }
    setLoading('rejected')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('rentals')
      .update({ status: 'rejected', cancel_reason: rejectReason.trim() })
      .eq('id', rentalId)

    if (user) {
      await supabase.from('messages').insert({
        rental_id: rentalId,
        sender_id: user.id,
        content: `【申請を却下しました】\n${rejectReason.trim()}`,
      })
    }

    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'rental_rejected', rentalId }),
    })

    setRejectModalOpen(false)
    setLoading(null)
    router.refresh()
  }

  if (status === 'rejected' || status === 'cancelled' || status === 'returned' || status === 'completed') {
    return null
  }

  if (status === 'returning' && !isOwner) return null

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3">
        {isOwner && status === 'pending' && (
          <>
            <Button
              onClick={() => setConfirmAction(CONFIRM_ACTIONS.approved)}
              loading={loading === 'approved'}
            >
              承認する
            </Button>
            <Button
              variant="danger"
              onClick={() => setRejectModalOpen(true)}
            >
              却下する
            </Button>
          </>
        )}

        {isOwner && status === 'approved' && (
          <Button
            onClick={() => setConfirmAction(CONFIRM_ACTIONS.active)}
            loading={loading === 'active'}
          >
            発送済みにする
          </Button>
        )}

        {isRenter && status === 'active' && (
          <Button
            onClick={() => setConfirmAction(CONFIRM_ACTIONS.returning)}
            loading={loading === 'returning'}
          >
            返却しました
          </Button>
        )}

        {isOwner && status === 'returning' && (
          <Button
            onClick={() => setConfirmAction(CONFIRM_ACTIONS.returned)}
            loading={loading === 'returned'}
          >
            受け取りました
          </Button>
        )}
      </div>

      {/* 確認モーダル */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title ?? ''}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">{confirmAction?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              戻る
            </Button>
            <Button
              loading={loading === confirmAction?.newStatus}
              onClick={() => confirmAction && updateStatus(confirmAction.newStatus)}
            >
              {confirmAction?.label}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 却下モーダル */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="申請を却下する"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            却下理由を入力してください。借り手に通知されます。
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              却下理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => { setRejectReason(e.target.value); setRejectError(false) }}
              className={`h-24 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${rejectError ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-amber-500'}`}
              maxLength={500}
              placeholder="例：その日はすでに別の方に貸し出し予定です"
            />
            {rejectError && (
              <p className="text-xs text-red-500">却下理由を入力してください</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              戻る
            </Button>
            <Button
              variant="danger"
              loading={loading === 'rejected'}
              onClick={handleReject}
            >
              却下する
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
