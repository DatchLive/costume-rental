import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { RENTAL_STATUS_LABELS } from '@/lib/constants'
import { StatusToggleClient } from './StatusToggleClient'
export const metadata: Metadata = { title: '出品した衣装' }

export default async function MyCostumesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/mypage/costumes')

  const { data: costumes } = await supabase
    .from('costumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
    available: { label: '公開中', variant: 'success' },
    renting: { label: 'レンタル中', variant: 'warning' },
    hidden: { label: '非公開', variant: 'default' },
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">出品した衣装</h1>
        <Link href="/costumes/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            出品する
          </Button>
        </Link>
      </div>

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
            const status = statusLabel[costume.status] ?? statusLabel.hidden
            return (
              <div
                key={costume.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                {/* Thumbnail */}
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {costume.images[0] ? (
                    <Image
                      src={costume.images[0]}
                      alt={costume.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/costumes/${costume.id}`}
                    className="line-clamp-1 font-medium text-gray-900 hover:text-amber-700"
                  >
                    {costume.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span>{formatPrice(costume.price_per_day)}/日</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {costume.status !== 'renting' && (
                    <StatusToggleClient costumeId={costume.id} currentStatus={costume.status as 'available' | 'hidden'} />
                  )}
                  <Link href={`/costumes/${costume.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      編集
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
