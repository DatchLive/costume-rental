'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FavoriteButtonProps {
  costumeId: string
  userId: string | null
  isFavorited: boolean
  size?: 'sm' | 'md'
}

export function FavoriteButton({ costumeId, userId, isFavorited: initialIsFavorited, size = 'sm' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push(`/login?next=/mypage/favorites`)
      return
    }

    if (isLoading) return
    setIsLoading(true)

    const supabase = createClient()
    const nextState = !isFavorited

    setIsFavorited(nextState)

    if (nextState) {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, costume_id: costumeId })
      if (error) setIsFavorited(!nextState)
    } else {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('costume_id', costumeId)
      if (error) setIsFavorited(!nextState)
    }

    setIsLoading(false)
  }

  const iconSize = size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  const buttonSize = size === 'md' ? 'h-9 w-9' : 'h-7 w-7'

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
      className={`flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110 ${buttonSize} ${isLoading ? 'opacity-60' : ''}`}
    >
      <Heart
        className={`${iconSize} transition-colors ${isFavorited ? 'fill-rose-500 text-rose-500' : 'fill-none text-gray-500'}`}
        aria-hidden="true"
      />
    </button>
  )
}
