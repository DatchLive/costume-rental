'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { COSTUME_CATEGORIES, JAPAN_PREFECTURES, COSTUME_SIZES } from '@/lib/constants'

export function CostumeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // Reset to page 1 on filter change
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  const resetFilters = useCallback(() => {
    router.push('/')
  }, [router])

  const hasFilters = ['category', 'size', 'area', 'min_price', 'max_price', 'ships_nationwide'].some(
    (key) => searchParams.has(key)
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        label="カテゴリ"
        value={searchParams.get('category') ?? ''}
        onChange={(e) => updateFilter('category', e.target.value)}
        placeholder="すべて"
        options={COSTUME_CATEGORIES.map((c) => ({ value: c, label: c }))}
        className="w-40"
      />

      <Select
        label="サイズ"
        value={searchParams.get('size') ?? ''}
        onChange={(e) => updateFilter('size', e.target.value)}
        placeholder="すべて"
        options={COSTUME_SIZES.map((s) => ({ value: s, label: s }))}
        className="w-32"
      />

      <Select
        label="エリア"
        value={searchParams.get('area') ?? ''}
        onChange={(e) => updateFilter('area', e.target.value)}
        placeholder="全国"
        options={JAPAN_PREFECTURES.map((p) => ({ value: p, label: p }))}
        className="w-36"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">価格（円/日）</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="下限"
            value={searchParams.get('min_price') ?? ''}
            onChange={(e) => updateFilter('min_price', e.target.value)}
            className="h-10 w-24 rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            min={0}
          />
          <span className="text-gray-400">〜</span>
          <input
            type="number"
            placeholder="上限"
            value={searchParams.get('max_price') ?? ''}
            onChange={(e) => updateFilter('max_price', e.target.value)}
            className="h-10 w-24 rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            min={0}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={searchParams.get('ships_nationwide') === 'true'}
          onChange={(e) => updateFilter('ships_nationwide', e.target.checked ? 'true' : '')}
          className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500"
        />
        全国発送のみ
      </label>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="mb-0.5">
          絞り込みをリセット
        </Button>
      )}
    </div>
  )
}
