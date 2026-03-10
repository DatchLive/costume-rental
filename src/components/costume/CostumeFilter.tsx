'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { COSTUME_CATEGORIES, COSTUME_COLOR_MAP, COSTUME_COLORS, JAPAN_PREFECTURES } from '@/lib/constants'

const DETAIL_KEYS = ['height', 'area', 'min_price', 'max_price', 'ships_nationwide', 'allows_handover', 'color', 'handover_area']

export function CostumeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [detailOpen, setDetailOpen] = useState(
    DETAIL_KEYS.some((key) => searchParams.has(key))
  )

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  const resetFilters = useCallback(() => {
    router.push('/')
  }, [router])

  const hasFilters = ['category', ...DETAIL_KEYS].some((key) => searchParams.has(key))
  const hasDetailFilters = DETAIL_KEYS.some((key) => searchParams.has(key))

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      {/* カテゴリ（常時表示） */}
      <div className="flex items-center gap-3">
        <Select
          label="カテゴリ"
          value={searchParams.get('category') ?? ''}
          onChange={(e) => updateFilter('category', e.target.value)}
          placeholder="すべてのカテゴリ"
          options={COSTUME_CATEGORIES.map((c) => ({ value: c, label: c }))}
          className="w-52"
        />

        <button
          type="button"
          onClick={() => setDetailOpen((v) => !v)}
          className="mt-5 flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          詳細検索
          {hasDetailFilters && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
              !
            </span>
          )}
          {detailOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 text-sm text-gray-400 hover:text-gray-600 hover:underline"
          >
            リセット
          </button>
        )}
      </div>

      {/* 詳細検索（トグル） */}
      {detailOpen && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">対応身長 (cm)</label>
            <input
              type="number"
              placeholder="例: 163"
              value={searchParams.get('height') ?? ''}
              onChange={(e) => updateFilter('height', e.target.value)}
              className="h-10 w-24 rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              min={50}
              max={250}
            />
          </div>

          <Select
            label="エリア"
            value={searchParams.get('area') ?? ''}
            onChange={(e) => updateFilter('area', e.target.value)}
            placeholder="全国"
            options={JAPAN_PREFECTURES.map((p) => ({ value: p, label: p }))}
            className="w-36"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">カラー</label>
            <div className="flex flex-wrap gap-1.5">
              {COSTUME_COLORS.map((color) => {
                const isSelected = searchParams.get('color') === color
                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    aria-label={color}
                    aria-pressed={isSelected}
                    onClick={() => updateFilter('color', isSelected ? '' : color)}
                    style={{ background: COSTUME_COLOR_MAP[color] }}
                    className={`h-6 w-6 rounded-full border transition-all ${
                      color === 'ホワイト' ? 'border-gray-300' : 'border-transparent'
                    } ${
                      isSelected
                        ? 'ring-2 ring-amber-500 ring-offset-1'
                        : 'hover:ring-2 hover:ring-gray-400 hover:ring-offset-1'
                    }`}
                  />
                )
              })}
            </div>
          </div>

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

          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={searchParams.get('allows_handover') === 'true'}
              onChange={(e) => updateFilter('allows_handover', e.target.checked ? 'true' : '')}
              className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500"
            />
            手渡し可のみ
          </label>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">手渡しエリア</label>
            <input
              type="text"
              placeholder="例：東京"
              value={searchParams.get('handover_area') ?? ''}
              onChange={(e) => updateFilter('handover_area', e.target.value)}
              className="h-10 w-36 rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      )}
    </div>
  )
}
