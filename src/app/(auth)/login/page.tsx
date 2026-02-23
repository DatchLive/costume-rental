'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, '6文字以上で入力してください'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const authError = searchParams.get('error')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('メールアドレスまたはパスワードが正しくありません')
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-amber-700">
            社交ダンス衣装レンタル
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">ログイン</h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {authError === 'auth_failed' && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              ログインに失敗しました。もう一度お試しください。
            </div>
          )}
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="メールアドレス"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="パスワード"
              type="password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="text-right">
              <Link
                href="/reset-password"
                className="text-sm text-amber-700 hover:underline"
              >
                パスワードを忘れた方
              </Link>
            </div>
            <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
              ログイン
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <GoogleSignInButton next={next} />

          <p className="mt-6 text-center text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="font-medium text-amber-700 hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
