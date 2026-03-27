import Image from 'next/image'
import { ImageOff } from 'lucide-react'

interface StepCardProps {
  step: number
  title: string
  image?: string
  alt?: string
  children: React.ReactNode
}

export function StepCard({ step, title, image, alt, children }: StepCardProps) {
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-amber-50 px-5 py-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">
          {step}
        </span>
        <span className="font-semibold text-gray-900">{title}</span>
      </div>

      {/* Image or placeholder */}
      {image ? (
        <div className="relative aspect-video w-full overflow-hidden border-b border-gray-100">
          <Image src={image} alt={alt ?? title} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 border-b border-gray-100 bg-gray-50">
          <ImageOff className="h-8 w-8 text-gray-300" />
          <p className="text-xs text-gray-400">
            {`/public/images/guide/step${step}.png`} に画像を配置できます
          </p>
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-4 text-sm leading-relaxed text-gray-700 [&_li]:mt-1.5 [&_p]:mt-0 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </div>
  )
}
