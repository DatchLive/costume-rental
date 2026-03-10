'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { RentalAddress } from '@/types/database'

const addressSchema = z.object({
  name: z.string().min(1, '必須項目です').max(100, '100文字以内で入力してください'),
  postal_code: z
    .string()
    .min(1, '必須項目です')
    .regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が正しくありません（例: 123-4567）'),
  address: z.string().min(1, '必須項目です').max(200, '200文字以内で入力してください'),
  phone: z.string().max(20, '20文字以内で入力してください').optional().or(z.literal('')),
  notes: z.string().max(200, '200文字以内で入力してください').optional().or(z.literal('')),
})

type AddressFormData = z.infer<typeof addressSchema>

interface ShippingAddressSectionProps {
  rentalId: string
  myRole: 'renter' | 'owner'
}

export function ShippingAddressSection({ rentalId, myRole }: ShippingAddressSectionProps) {
  const otherRole = myRole === 'renter' ? 'owner' : 'renter'
  const myLabel = myRole === 'renter' ? '自分の受取住所（送付先）' : '自分の返却受取住所'
  const otherLabel = myRole === 'renter' ? '出品者の返却先住所' : '借り手の受取住所（送付先）'

  const [myAddress, setMyAddress] = useState<RentalAddress | null>(null)
  const [otherAddress, setOtherAddress] = useState<RentalAddress | null>(null)
  const [editing, setEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) })

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('rental_addresses')
      .select('*')
      .eq('rental_id', rentalId)
      .then(({ data }) => {
        if (data) {
          const my = data.find((a) => a.role === myRole) ?? null
          const other = data.find((a) => a.role === otherRole) ?? null
          setMyAddress(my)
          setOtherAddress(other)
          if (my) reset({ name: my.name, postal_code: my.postal_code, address: my.address, phone: my.phone ?? '', notes: my.notes ?? '' })
        }
        setLoading(false)
      })
  }, [rentalId, myRole, otherRole, reset])

  async function onSubmit(data: AddressFormData) {
    setServerError(null)
    const supabase = createClient()

    const payload = {
      rental_id: rentalId,
      role: myRole,
      name: data.name,
      postal_code: data.postal_code,
      address: data.address,
      phone: data.phone || null,
      notes: data.notes || null,
    }

    const { data: saved, error } = myAddress
      ? await supabase
          .from('rental_addresses')
          .update(payload)
          .eq('rental_id', rentalId)
          .eq('role', myRole)
          .select()
          .single()
      : await supabase
          .from('rental_addresses')
          .insert(payload)
          .select()
          .single()

    if (error) {
      setServerError('保存中にエラーが発生しました。もう一度お試しください。')
      return
    }

    setMyAddress(saved)
    setEditing(false)
  }

  if (loading) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-gray-900">配送先情報</h2>

      <div className="flex flex-col gap-6">
        {/* 自分の住所 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">{myLabel}</h3>
            {myAddress && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-amber-700 hover:underline"
              >
                <Pencil className="h-3 w-3" />
                編集
              </button>
            )}
          </div>

          {!editing && myAddress ? (
            <AddressCard address={myAddress} />
          ) : editing || !myAddress ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              {serverError && (
                <p className="text-xs text-red-600">{serverError}</p>
              )}
              <Input
                label="氏名"
                required
                placeholder="山田 花子"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="郵便番号"
                required
                placeholder="123-4567"
                error={errors.postal_code?.message}
                {...register('postal_code')}
              />
              <Input
                label="住所"
                required
                placeholder="東京都渋谷区〇〇 1-2-3"
                error={errors.address?.message}
                {...register('address')}
              />
              <Input
                label="電話番号（任意）"
                placeholder="090-1234-5678"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Textarea
                label="備考（任意）"
                rows={2}
                placeholder="不在時の対応など"
                error={errors.notes?.message}
                {...register('notes')}
              />
              <div className="flex gap-2">
                {editing && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                    キャンセル
                  </Button>
                )}
                <Button type="submit" size="sm" loading={isSubmitting} className="flex-1">
                  {myAddress ? '更新する' : '登録する'}
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        {/* 相手の住所 */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">{otherLabel}</h3>
          {otherAddress ? (
            <AddressCard address={otherAddress} />
          ) : (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-400">
              相手が住所を登録すると表示されます
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function AddressCard({ address }: { address: RentalAddress }) {
  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-800">
      <p className="font-medium">{address.name}</p>
      <p className="mt-0.5 text-gray-500">〒{address.postal_code}</p>
      <p>{address.address}</p>
      {address.phone && <p className="mt-0.5 text-gray-500">{address.phone}</p>}
      {address.notes && <p className="mt-1 text-xs text-gray-400">{address.notes}</p>}
    </div>
  )
}
