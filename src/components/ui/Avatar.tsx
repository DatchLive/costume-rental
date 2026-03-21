import Image from 'next/image'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name ? name.charAt(0) : null

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-amber-800',
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? 'ユーザー'}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        <span className="font-medium">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2" aria-hidden="true" />
      )}
    </div>
  )
}

export { Avatar }
