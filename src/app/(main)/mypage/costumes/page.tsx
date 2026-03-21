import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Plus, Pencil } from 'lucide-react'
import { DeleteCostumeButton } from './DeleteCostumeButton'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { StatusToggleClient } from './StatusToggleClient'
export const metadata: Metadata = { title: '出品した衣装' }

export default async function MyCostumesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/mypage/costumes')

  const [{ data: costumes }, { data: activeRentals }] = await Promise.all([
    supabase
      .from('costumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('rentals')
      .select('costume_id')
      .eq('owner_id', user.id)
      .in('status', ['pending', 'approved', 'active', 'returning', 'returned']),
  ])

  const rentingCostumeIds = new Set((activeRentals ?? []).map((r) => r.costume_id))

  const statusLabel: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> =
    {
      available: { label: '公開中', variant: 'success' },
      hidden: { label: '非公開', variant: 'default' },
    }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">出品した衣装</h1>

      {!costumes || costumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="mb-4 text-gray-500">まだ衣装を出品していません</p>
          <Link href="/costumes/new">
            <Button>はじめて出品する</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {costumes.map((costume) => {
            const isRenting = rentingCostumeIds.has(costume.id)
            const status = isRenting
              ? { label: 'レンタル中', variant: 'warning' as const }
              : (statusLabel[costume.status] ?? statusLabel.hidden)
            return (
              <div
                key={costume.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white"
              >
                {/* 上段: サムネイル + 情報 */}
                <div className="flex items-center gap-3 p-4">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {costume.images[0] ? (
                      <Image
                        src={costume.images[0]}
                        alt={costume.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/costumes/${costume.id}`}
                      className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-amber-700"
                    >
                      {costume.title}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-sm font-medium text-amber-700">
                        {formatPrice(costume.rental_price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 下段: アクションボタン */}
                <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
                  {!isRenting && (
                    <StatusToggleClient
                      costumeId={costume.id}
                      currentStatus={costume.status as 'available' | 'hidden'}
                    />
                  )}
                  <div className="flex flex-1 justify-end gap-2">
                    <Link href={`/costumes/${costume.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        編集
                      </Button>
                    </Link>
                    <DeleteCostumeButton
                      costumeId={costume.id}
                      images={costume.images}
                      isDeletable={!isRenting}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {costumes && costumes.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Link href="/costumes/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              出品する
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
