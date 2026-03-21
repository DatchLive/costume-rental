'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  label,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const displayValue = readonly ? value : hovered || value

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div
        className="flex items-center gap-0.5"
        role={readonly ? undefined : 'group'}
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            )}
            aria-label={`${star}星`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= displayValue
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200',
              )}
            />
          </button>
        ))}
        {readonly && value > 0 && (
          <span className="ml-1 text-sm text-gray-600">{value.toFixed(1)}</span>
        )}
      </div>
    </div>
  )
}

export { StarRating }
