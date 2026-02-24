'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rentalRequestSchema, type RentalRequestFormData } from '@/lib/validations/rental'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { formatPrice, calcTotalPrice, calcRentalDays } from '@/lib/utils'
import { MIN_RENTAL_DAYS, MAX_RENTAL_DAYS } from '@/lib/constants'

interface RentalRequestFormProps {
  pricePerDay: number
  onSubmit: (data: RentalRequestFormData) => Promise<void>
}

export function RentalRequestForm({
  pricePerDay,
  onSubmit,
}: RentalRequestFormProps) {
  const minDays = MIN_RENTAL_DAYS
  const maxDays = MAX_RENTAL_DAYS
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RentalRequestFormData>({ resolver: zodResolver(rentalRequestSchema) })

  const startDate = watch('start_date')
  const endDate = watch('end_date')

  const days = startDate && endDate && endDate > startDate
    ? calcRentalDays(startDate, endDate)
    : 0

  const totalPrice = days > 0 ? calcTotalPrice(pricePerDay, startDate, endDate) : 0

  const minDateStr = new Date().toISOString().slice(0, 10)

  async function handleFormSubmit(data: RentalRequestFormData) {
    const days = calcRentalDays(data.start_date, data.end_date)
    if (days < minDays) {
      setServerError(`最短レンタル期間は${minDays}日です`)
      return
    }
    if (days > maxDays) {
      setServerError(`最長レンタル期間は${maxDays}日です`)
      return
    }
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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            開始日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={minDateStr}
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            {...register('start_date')}
          />
          {errors.start_date && (
            <p className="text-xs text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            終了日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={startDate || minDateStr}
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            {...register('end_date')}
          />
          {errors.end_date && (
            <p className="text-xs text-red-500">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        レンタル可能期間: {minDays}日〜{maxDays}日
      </p>

      {days > 0 && (
        <div className="rounded-lg bg-amber-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{formatPrice(pricePerDay)} × {days}日</span>
            <span className="font-bold text-amber-700">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      )}

      <Textarea
        label="出品者へのメッセージ（任意）"
        placeholder="質問や確認事項があればご記入ください"
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
