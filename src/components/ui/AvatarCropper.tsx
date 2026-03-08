'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface AvatarCropperProps {
  onCropped: (blob: Blob) => void
}

function centerSquareCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
    width,
    height,
  )
}

export function AvatarCropper({ onCropped }: AvatarCropperProps) {
  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [open, setOpen] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setSrcUrl(url)
    setCrop(undefined)
    setOpen(true)
    // 同じファイルを再選択できるようにリセット
    e.target.value = ''
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setCrop(centerSquareCrop(naturalWidth, naturalHeight))
  }

  const handleCropConfirm = useCallback(async () => {
    const img = imgRef.current
    if (!img || !crop) return

    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 円形にクリップ
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const cropX = (crop.unit === '%' ? (crop.x / 100) * img.width : crop.x) * scaleX
    const cropY = (crop.unit === '%' ? (crop.y / 100) * img.height : crop.y) * scaleY
    const cropW = (crop.unit === '%' ? (crop.width / 100) * img.width : crop.width) * scaleX
    const cropH = (crop.unit === '%' ? (crop.height / 100) * img.height : crop.height) * scaleY

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, size, size)

    canvas.toBlob((blob) => {
      if (!blob) return
      onCropped(blob)
      setOpen(false)
      if (srcUrl) URL.revokeObjectURL(srcUrl)
      setSrcUrl(null)
    }, 'image/jpeg', 0.9)
  }, [crop, srcUrl, onCropped])

  function handleClose() {
    setOpen(false)
    if (srcUrl) URL.revokeObjectURL(srcUrl)
    setSrcUrl(null)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        画像を変更
      </Button>

      <Modal open={open} onClose={handleClose} title="プロフィール画像を切り抜く">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">円の範囲をドラッグして調整してください</p>
          {srcUrl && (
            <div className="flex justify-center overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
                minWidth={50}
              >
                <img
                  ref={imgRef}
                  src={srcUrl}
                  alt="クロップ対象"
                  onLoad={handleImageLoad}
                  style={{ maxHeight: '60vh', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="button" onClick={handleCropConfirm}>
              この範囲で確定
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
