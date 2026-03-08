'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'

interface ImageGalleryProps {
  images: string[]
  title: string
  isRenting: boolean
}

export function ImageGallery({ images, title, isRenting }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
        <div className="flex h-full items-center justify-center text-gray-300">
          <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* メイン画像 */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={images[selectedIndex]}
          alt={`${title} ${selectedIndex + 1}枚目`}
          fill
          className="object-cover"
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {isRenting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="warning" className="text-sm">レンタル中</Badge>
          </div>
        )}
      </div>

      {/* サムネイル */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                selectedIndex === i ? 'border-amber-600' : 'border-transparent'
              }`}
              aria-label={`${i + 1}枚目の画像`}
            >
              <Image
                src={url}
                alt={`${title} ${i + 1}枚目`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
