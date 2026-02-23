'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { costumeSchema, type CostumeFormData } from '@/lib/validations/costume'
import { COSTUME_CATEGORIES, JAPAN_PREFECTURES, COSTUME_SIZES, MIN_RENTAL_DAYS, MAX_RENTAL_DAYS } from '@/lib/constants'
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
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CostumeFormData>({
    resolver: zodResolver(costumeSchema),
    defaultValues: {
      ships_nationwide: false,
      min_rental_days: MIN_RENTAL_DAYS,
      max_rental_days: MAX_RENTAL_DAYS,
      ...defaultValues,
    },
  })

  const pricePerDay = watch('price_per_day')

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

        <Select
          label="サイズ"
          placeholder="選択してください"
          options={COSTUME_SIZES.map((s) => ({ value: s, label: s }))}
          error={errors.size?.message}
          {...register('size')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="レンタル料金（円/日）"
          type="number"
          required
          min={100}
          max={100000}
          hint={pricePerDay ? `7日間レンタルで ¥${(Number(pricePerDay) * 7).toLocaleString('ja-JP')}` : undefined}
          error={errors.price_per_day?.message}
          {...register('price_per_day', { valueAsNumber: true })}
        />

        <Select
          label="エリア（都道府県）"
          placeholder="選択してください"
          options={JAPAN_PREFECTURES.map((p) => ({ value: p, label: p }))}
          error={errors.area?.message}
          {...register('area')}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500"
          {...register('ships_nationwide')}
        />
        <span className="text-sm font-medium text-gray-700">全国発送に対応する</span>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="最短レンタル日数"
          type="number"
          required
          min={MIN_RENTAL_DAYS}
          max={MAX_RENTAL_DAYS}
          hint="最低2日から設定できます"
          error={errors.min_rental_days?.message}
          {...register('min_rental_days', { valueAsNumber: true })}
        />
        <Input
          label="最長レンタル日数"
          type="number"
          required
          min={MIN_RENTAL_DAYS}
          max={30}
          error={errors.max_rental_days?.message}
          {...register('max_rental_days', { valueAsNumber: true })}
        />
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
