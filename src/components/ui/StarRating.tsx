import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RatingValue } from '@/types/database'

interface RatingBadgeProps {
  value: RatingValue
  size?: 'sm' | 'md'
}

export function RatingBadge({ value, size = 'md' }: RatingBadgeProps) {
  const isGood = value === 'good'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
      )}
    >
      {isGood
        ? <ThumbsUp className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} aria-hidden="true" />
        : <ThumbsDown className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} aria-hidden="true" />
      }
      {isGood ? '良かった' : '残念だった'}
    </span>
  )
}

// Keep backward-compatible named export used in legacy imports
export { RatingBadge as StarRating }
