'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile'
import { JAPAN_PREFECTURES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

interface ProfileEditClientProps {
  userId: string
  initialValues: {
    name: string
    area: string
    bio: string
  }
  initialAvatarUrl: string | null
}

export function ProfileEditClient({ userId, initialValues, initialAvatarUrl }: ProfileEditClientProps) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  })

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      setServerError('アバター画像のアップロードに失敗しました')
      setAvatarUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
    setAvatarUploading(false)
  }

  async function onSubmit(data: ProfileFormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        area: data.area ?? null,
        bio: data.bio ?? null,
        avatar_url: avatarUrl,
      })
      .eq('id', userId)

    if (error) {
      setServerError('保存中にエラーが発生しました')
      return
    }

    setSuccess(true)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">プロフィールを保存しました</div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={initialValues.name} size="xl" />
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            画像を変更
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="mt-1 text-xs text-gray-500">JPEG / PNG / WebP・2MB以内</p>
        </div>
      </div>

      <Input
        label="お名前"
        required
        maxLength={50}
        error={errors.name?.message}
        {...register('name')}
      />

      <Select
        label="都道府県"
        placeholder="選択してください"
        options={JAPAN_PREFECTURES.map((p) => ({ value: p, label: p }))}
        error={errors.area?.message}
        {...register('area')}
      />

      <Textarea
        label="自己紹介"
        rows={4}
        maxLength={500}
        placeholder="社交ダンス歴、得意な種目など"
        error={errors.bio?.message}
        {...register('bio')}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" loading={isSubmitting}>
          保存する
        </Button>
      </div>
    </form>
  )
}
