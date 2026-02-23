'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const emailSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

const newPasswordSchema = z
  .object({
    password: z.string().min(8, '8文字以上で入力してください'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type EmailFormData = z.infer<typeof emailSchema>
type NewPasswordFormData = z.infer<typeof newPasswordSchema>

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isRecovery = searchParams.get('type') === 'recovery'
  const [emailSent, setEmailSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) })
  const passwordForm = useForm<NewPasswordFormData>({ resolver: zodResolver(newPasswordSchema) })

  async function onEmailSubmit(data: EmailFormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password?type=recovery`,
    })
    if (error) {
      setServerError('送信中にエラーが発生しました。もう一度お試しください。')
      return
    }
    setEmailSent(true)
  }

  async function onNewPasswordSubmit(data: NewPasswordFormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setServerError('パスワードの更新に失敗しました。もう一度お試しください。')
      return
    }
    router.push('/login?message=password_updated')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-amber-700">
            社交ダンス衣装レンタル
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            {isRecovery ? '新しいパスワードを設定' : 'パスワードリセット'}
          </h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {isRecovery ? (
            <form onSubmit={passwordForm.handleSubmit(onNewPasswordSubmit)} className="flex flex-col gap-4">
              <Input
                label="新しいパスワード"
                type="password"
                autoComplete="new-password"
                required
                hint="8文字以上"
                error={passwordForm.formState.errors.password?.message}
                {...passwordForm.register('password')}
              />
              <Input
                label="新しいパスワード（確認）"
                type="password"
                autoComplete="new-password"
                required
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
              <Button
                type="submit"
                loading={passwordForm.formState.isSubmitting}
                size="lg"
                className="w-full"
              >
                パスワードを更新する
              </Button>
            </form>
          ) : emailSent ? (
            <div className="text-center">
              <div className="mb-4 text-4xl">✉️</div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                メールを送信しました
              </h2>
              <p className="text-sm text-gray-600">
                パスワードリセット用のリンクをメールでお送りしました。
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-medium text-amber-700 hover:underline"
              >
                ログインページへ戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>
              <Input
                label="メールアドレス"
                type="email"
                autoComplete="email"
                required
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register('email')}
              />
              <Button
                type="submit"
                loading={emailForm.formState.isSubmitting}
                size="lg"
                className="w-full"
              >
                リセットメールを送信
              </Button>
              <Link
                href="/login"
                className="text-center text-sm text-amber-700 hover:underline"
              >
                ログインページへ戻る
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
