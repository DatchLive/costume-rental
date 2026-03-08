'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressCostumeImage } from '@/lib/compressImage'
import { Spinner } from '@/components/ui/Spinner'
import { CostumeCropper } from './CostumeCropper'

interface ImageUploaderProps {
  userId: string
  initialImages?: string[]
  maxImages?: number
  onImagesChange: (urls: string[]) => void
}

export function ImageUploader({
  userId,
  initialImages = [],
  maxImages = 3,
  onImagesChange,
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // クロップ待ちのファイルキュー
  const [cropQueue, setCropQueue] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxImages - images.length
      const filesToCrop = acceptedFiles.slice(0, remaining)

      if (filesToCrop.length === 0) {
        setError(`最大${maxImages}枚までアップロードできます`)
        return
      }

      setError(null)
      setCropQueue(filesToCrop)
    },
    [images, maxImages]
  )

  async function handleCropped(blob: Blob) {
    // キューから先頭を取り出す
    const remaining = cropQueue.slice(1)
    setCropQueue(remaining)

    setUploading(true)
    const supabase = createClient()

    const compressed = await compressCostumeImage(new File([blob], 'costume.jpg', { type: 'image/jpeg' }))
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('costume-images')
      .upload(path, compressed, { contentType: 'image/jpeg' })

    if (uploadError) {
      setError('画像のアップロードに失敗しました')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('costume-images')
      .getPublicUrl(path)

    const updated = [...images, publicUrl]
    setImages(updated)
    onImagesChange(updated)
    setUploading(false)
  }

  function handleCropCancel() {
    // キャンセル時はキュー全体を破棄
    setCropQueue([])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 20 * 1024 * 1024,
    disabled: uploading || images.length >= maxImages || cropQueue.length > 0,
  })

  async function removeImage(url: string, index: number) {
    const supabase = createClient()
    const urlObj = new URL(url)
    const path = urlObj.pathname.split('/costume-images/')[1]
    if (path) {
      await supabase.storage.from('costume-images').remove([path])
    }
    const updated = images.filter((_, i) => i !== index)
    setImages(updated)
    onImagesChange(updated)
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">
        衣装の写真（最大{maxImages}枚）
      </label>

      {/* クロッパー：キューの先頭ファイルを表示 */}
      {cropQueue.length > 0 && (
        <CostumeCropper
          file={cropQueue[0]}
          onCropped={handleCropped}
          onCancel={handleCropCancel}
        />
      )}

      {/* サムネイル */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={url} className="relative h-24 w-[72px] overflow-hidden rounded-lg border border-gray-200">
              <Image src={url} alt={`衣装画像${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url, index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                aria-label="画像を削除"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ドロップゾーン */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
            isDragActive
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
          } ${uploading || cropQueue.length > 0 ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Spinner />
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-gray-400" aria-hidden="true" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'ドロップして追加' : 'クリックまたはドラッグで追加'}
              </p>
              <p className="mt-1 text-xs text-gray-400">JPEG / PNG / WebP・自動圧縮されます</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
