'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

const signupSchema = z
  .object({
    name: z.string().min(1, '必須項目です').max(50, '50文字以内で入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, '8文字以上で入力してください'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(data: SignupFormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('このメールアドレスはすでに登録されています')
      } else {
        setServerError('登録中にエラーが発生しました。もう一度お試しください。')
      }
      return
    }

    setDone(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-amber-700">
            社交ダンス衣装レンタル
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">新規登録</h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <div className="mb-4 text-4xl">✉️</div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                確認メールを送信しました
              </h2>
              <p className="text-sm text-gray-600">
                メールに記載されたリンクをクリックして、登録を完了してください。
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-medium text-amber-700 hover:underline"
              >
                ログインページへ
              </Link>
            </div>
          ) : (
            <>
              {serverError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="お名前"
                  type="text"
                  autoComplete="name"
                  required
                  error={errors.name?.message}
                  {...register('name')}
                />
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
                  autoComplete="new-password"
                  required
                  hint="8文字以上"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="パスワード（確認）"
                  type="password"
                  autoComplete="new-password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
                  登録する
                </Button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <hr className="flex-1 border-gray-200" />
                <span className="text-xs text-gray-400">または</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <GoogleSignInButton />

              <p className="mt-6 text-center text-sm text-gray-600">
                すでにアカウントをお持ちの方は{' '}
                <Link href="/login" className="font-medium text-amber-700 hover:underline">
                  ログイン
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
