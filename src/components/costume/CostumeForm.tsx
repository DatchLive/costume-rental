'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { costumeSchema, type CostumeFormData } from '@/lib/validations/costume'
import { COSTUME_CATEGORIES, JAPAN_PREFECTURES } from '@/lib/constants'
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
  } = useForm<CostumeFormData>({
    resolver: zodResolver(costumeSchema),
    defaultValues: {
      ships_nationwide: false,
      allows_handover: false,
      ...defaultValues,
    },
  })


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

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500"
          {...register('allows_handover')}
        />
        <span className="text-sm font-medium text-gray-700">手渡しに対応する</span>
      </label>

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
