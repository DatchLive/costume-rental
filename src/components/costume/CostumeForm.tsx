'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { costumeSchema, type CostumeFormData } from '@/lib/validations/costume'
import { CLEANING_RESPONSIBILITY_OPTIONS, COSTUME_CATEGORIES, COSTUME_COLOR_MAP, COSTUME_COLORS, JAPAN_PREFECTURES, TANNING_POLICY_OPTIONS } from '@/lib/constants'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from './ImageUploader'

interface CostumeFormProps {
  userId: string
  defaultValues?: Partial<CostumeFormData>
  initialImages?: string[]
  maxImages?: number
  onSubmit: (data: CostumeFormData, images: string[]) => Promise<void>
  submitLabel?: string
}

export function CostumeForm({
  userId,
  defaultValues,
  initialImages = [],
  maxImages = 3,
  onSubmit,
  submitLabel = '登録する',
}: CostumeFormProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CostumeFormData>({
    resolver: zodResolver(costumeSchema),
    defaultValues: {
      ships_nationwide: false,
      allows_handover: false,
      tanning_policy: 'none',
      colors: [],
      cleaning_responsibility: 'renter_home',
      ...defaultValues,
    },
  })

  const selectedColors = watch('colors') ?? []
  const allowsHandover = watch('allows_handover')

  function toggleColor(color: string) {
    if (selectedColors.includes(color)) {
      setValue('colors', selectedColors.filter((c) => c !== color))
    } else if (selectedColors.length < 2) {
      setValue('colors', [...selectedColors, color])
    }
  }


  async function handleFormSubmit(data: CostumeFormData) {
    setServerError(null)
    try {
      await onSubmit(data, images)
    } catch {
      setServerError('保存中にエラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      <ImageUploader
        userId={userId}
        initialImages={initialImages}
        maxImages={maxImages}
        onImagesChange={setImages}
      />

      <Input
        label="タイトル"
        required
        maxLength={100}
        placeholder="例：ラテン競技ドレス（ブルー系）"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="説明"
        rows={4}
        maxLength={2000}
        placeholder="衣装の特徴、状態、サイズ感などを記載してください"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="カテゴリ"
          required
          placeholder="選択してください"
          options={COSTUME_CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register('category')}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">対応身長 (cm)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="最低"
              min={50}
              max={250}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              {...register('height_min', { valueAsNumber: true })}
            />
            <span className="shrink-0 text-gray-400">〜</span>
            <input
              type="number"
              placeholder="最高"
              min={50}
              max={250}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              {...register('height_max', { valueAsNumber: true })}
            />
          </div>
          {(errors.height_min || errors.height_max) && (
            <p className="text-xs text-red-600">
              {errors.height_min?.message ?? errors.height_max?.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">カラー</label>
          <span className="text-xs text-gray-400">{selectedColors.length}/2</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {COSTUME_COLORS.map((color) => {
            const isSelected = selectedColors.includes(color)
            const isDisabled = !isSelected && selectedColors.length >= 2
            return (
              <button
                key={color}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleColor(color)}
                title={color}
                className={`flex flex-col items-center gap-1 transition-opacity ${isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
              >
                <span
                  style={{ background: COSTUME_COLOR_MAP[color] }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                    color === 'ホワイト' ? 'border-gray-300' : 'border-transparent'
                  } ${isSelected ? 'ring-2 ring-amber-500 ring-offset-1' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'}`}
                >
                  {isSelected && (
                    <svg className="h-4 w-4 drop-shadow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8l3.5 3.5L13 5" stroke={color === 'ホワイト' || color === 'イエロー' || color === 'ベージュ' ? '#374151' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-[10px] leading-tight text-gray-600">{color}</span>
              </button>
            )
          })}
        </div>
        {errors.colors && (
          <p className="text-xs text-red-600">{errors.colors.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="レンタル料金（一律）"
          type="number"
          required
          min={100}
          max={100000}
          error={errors.rental_price?.message}
          {...register('rental_price', { valueAsNumber: true })}
        />

        <div className="flex flex-col gap-1">
          <Input
            label="学生料金（任意）"
            type="number"
            min={0}
            max={100000}
            placeholder="未設定の場合は空欄"
            error={errors.student_price?.message}
            {...register('student_price', { valueAsNumber: true })}
          />
          <p className="text-xs text-gray-400">適用はメッセージで当事者間にて確認してください</p>
        </div>
      </div>

      <Select
        label="エリア（都道府県）"
        placeholder="選択してください"
        options={JAPAN_PREFECTURES.map((p) => ({ value: p, label: p }))}
        error={errors.area?.message}
        {...register('area')}
      />

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500"
          {...register('ships_nationwide')}
        />
        <span className="text-sm font-medium text-gray-700">全国発送に対応する</span>
      </label>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500"
          {...register('allows_handover')}
        />
        <span className="text-sm font-medium text-gray-700">手渡しに対応する</span>
      </label>

      {allowsHandover && (
        <Input
          label="手渡し可能エリア"
          placeholder="例：東京・横浜・大会会場 など"
          maxLength={200}
          error={errors.handover_area?.message}
          {...register('handover_area')}
        />
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700">クリーニング設定</h3>
        <Select
          label="クリーニング負担"
          required
          options={CLEANING_RESPONSIBILITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          error={errors.cleaning_responsibility?.message}
          {...register('cleaning_responsibility')}
        />
        <Textarea
          label="クリーニング特記事項（任意）"
          rows={2}
          maxLength={200}
          placeholder="例：ホームクリーニング時はネット使用をお願いします"
          error={errors.cleaning_notes?.message}
          {...register('cleaning_notes')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">セルタン・ボディファン</label>
        <div className="flex flex-col gap-2">
          {TANNING_POLICY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                value={opt.value}
                className="h-4 w-4 border-gray-300 text-amber-700 focus:ring-amber-500"
                {...register('tanning_policy')}
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.tanning_policy && (
          <p className="text-xs text-red-600">{errors.tanning_policy.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => history.back()}>
          キャンセル
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
