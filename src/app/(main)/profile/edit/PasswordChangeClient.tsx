'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Pencil } from 'lucide-react'

const schema = z
  .object({
    password: z.string().min(8, '8文字以上で入力してください'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function PasswordChangeClient() {
  const [editing, setEditing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function handleCancel() {
    reset()
    setServerError(null)
    setEditing(false)
  }

  async function onSubmit(data: FormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setServerError('パスワードの変更に失敗しました。もう一度お試しください。')
      return
    }

    reset()
    setSuccess(true)
    setEditing(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  // 表示モード
  if (!editing) {
    return (
      <div className="flex flex-col gap-4">
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            パスワードを変更しました
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">パスワード</p>
            <p className="mt-1 text-sm text-gray-900">••••••••</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            変更する
          </Button>
        </div>
      </div>
    )
  }

  // 編集モード
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      <Input
        label="新しいパスワード"
        type="password"
        autoComplete="new-password"
        required
        hint="8文字以上"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="新しいパスワード（確認）"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={isSubmitting}>
          パスワードを変更する
        </Button>
      </div>
    </form>
  )
}
