'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rentalRequestSchema, type RentalRequestFormData } from '@/lib/validations/rental'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { formatPrice } from '@/lib/utils'

interface RentalRequestFormProps {
  rentalPrice: number
  onSubmit: (data: RentalRequestFormData) => Promise<void>
}

export function RentalRequestForm({ rentalPrice, onSubmit }: RentalRequestFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RentalRequestFormData>({ resolver: zodResolver(rentalRequestSchema) })

  const minDateStr = new Date().toISOString().slice(0, 10)

  async function handleFormSubmit(data: RentalRequestFormData) {
    setServerError(null)
    try {
      await onSubmit(data)
    } catch {
      setServerError('申請中にエラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <h2 className="font-semibold text-gray-900">レンタル申請</h2>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          使用日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          min={minDateStr}
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          {...register('use_date')}
        />
        {errors.use_date && (
          <p className="text-xs text-red-500">{errors.use_date.message}</p>
        )}
      </div>

      <div className="rounded-lg bg-amber-50 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">レンタル料金</span>
          <span className="font-bold text-amber-700">{formatPrice(rentalPrice)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          ※ 詳細な期間・受け渡し方法はメッセージで調整してください
        </p>
      </div>

      <Textarea
        label="出品者へのメッセージ（任意）"
        placeholder="使用目的や質問があればご記入ください"
        rows={3}
        error={errors.message?.message}
        {...register('message')}
      />

      <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
        レンタルを申請する
      </Button>
    </form>
  )
}
