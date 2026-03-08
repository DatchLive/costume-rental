'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface DeleteCostumeButtonProps {
  costumeId: string
  images: string[]
  isDeletable: boolean
}

export function DeleteCostumeButton({ costumeId, images, isDeletable }: DeleteCostumeButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // DB削除をトランザクションで実行（favorites・costume_reviews・costume を一括削除）
    const { error: deleteError } = await supabase.rpc('delete_costume', {
      p_costume_id: costumeId,
    })

    if (deleteError) {
      setError('削除に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }

    // DB削除成功後にStorageの画像を削除（失敗してもDBは正常）
    if (images.length > 0) {
      const paths = images.map((url) => {
        try {
          return new URL(url).pathname.split('/costume-images/')[1]
        } catch {
          return null
        }
      }).filter(Boolean) as string[]

      if (paths.length > 0) {
        await supabase.storage.from('costume-images').remove(paths)
      }
    }

    setOpen(false)
    router.refresh()
  }

  if (!isDeletable) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="取引中または申請中のため削除できません"
        className="gap-1 text-gray-300"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        削除
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1 text-red-600 hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        削除
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="衣装を削除しますか？">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            削除すると元に戻せません。この衣装に関するお気に入りや衣装レビューも削除されます。
          </p>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button variant="danger" loading={loading} onClick={handleDelete}>
              削除する
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
