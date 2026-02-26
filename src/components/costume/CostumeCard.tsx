import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Truck, Handshake } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { COSTUME_COLOR_MAP } from '@/lib/constants'
import { CategoryBadge } from './CategoryBadge'
import type { CostumeWithProfile } from '@/types/database'

interface CostumeCardProps {
  costume: CostumeWithProfile
}

export function CostumeCard({ costume }: CostumeCardProps) {
  const mainImage = costume.images[0]

  return (
    <Link
      href={`/costumes/${costume.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={costume.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute left-2 top-2">
          <CategoryBadge category={costume.category} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{costume.title}</h3>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          {costume.area && (
            <>
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{costume.area}</span>
            </>
          )}
          {costume.ships_nationwide && (
            <span className="ml-1 flex items-center gap-0.5 text-green-700">
              <Truck className="h-3 w-3" aria-hidden="true" />
              全国発送
            </span>
          )}
          {costume.allows_handover && (
            <span className="ml-1 flex items-center gap-0.5 text-blue-700">
              <Handshake className="h-3 w-3" aria-hidden="true" />
              手渡し可
            </span>
          )}
        </div>

        {(costume.height_min || costume.height_max) && (
          <span className="text-xs text-gray-500">
            対応身長: {costume.height_min ?? ''}〜{costume.height_max ?? ''}cm
          </span>
        )}

        {costume.colors && costume.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {costume.colors.map((color) => (
              <span
                key={color}
                title={color}
                style={{ background: COSTUME_COLOR_MAP[color] }}
                className={`h-3.5 w-3.5 rounded-full border ${color === 'ホワイト' ? 'border-gray-300' : 'border-gray-200/60'}`}
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <span className="text-base font-bold text-amber-700">
            {formatPrice(costume.rental_price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
