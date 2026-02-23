'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

const contactSchema = z.object({
  name: z.string().min(1, '必須項目です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  subject: z.string().min(1, '必須項目です'),
  message: z.string().min(10, '10文字以上入力してください').max(2000),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactFormClient() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  async function onSubmit(data: ContactFormData) {
    setServerError(null)
    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contact', ...data }),
    })

    if (!res.ok) {
      setServerError('送信中にエラーが発生しました。もう一度お試しください。')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-green-50 p-6 text-center">
        <p className="font-medium text-green-700">お問い合わせを受け付けました。</p>
        <p className="mt-1 text-sm text-green-600">2〜3営業日以内にご返答いたします。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}
      <Input label="お名前" required error={errors.name?.message} {...register('name')} />
      <Input label="メールアドレス" type="email" required error={errors.email?.message} {...register('email')} />
      <Input label="件名" required error={errors.subject?.message} {...register('subject')} />
      <Textarea label="お問い合わせ内容" required rows={6} error={errors.message?.message} {...register('message')} />
      <Button type="submit" loading={isSubmitting}>送信する</Button>
    </form>
  )
}
