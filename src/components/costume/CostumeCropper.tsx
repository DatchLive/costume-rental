'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

// 縦長 3:4（width:height）
const ASPECT = 3 / 4

interface CostumeCropperProps {
  file: File
  onCropped: (blob: Blob) => void
  onCancel: () => void
}

export function CostumeCropper({ file, onCropped, onCancel }: CostumeCropperProps) {
  const [srcUrl] = useState(() => URL.createObjectURL(file))
  const [crop, setCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement>(null)

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setCrop(
      centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, ASPECT, naturalWidth, naturalHeight),
        naturalWidth,
        naturalHeight,
      ),
    )
  }

  const handleConfirm = useCallback(async () => {
    const img = imgRef.current
    if (!img || !crop) return

    const canvas = document.createElement('canvas')
    const outputW = 900
    const outputH = 1200 // 3:4
    canvas.width = outputW
    canvas.height = outputH

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const cropX = (crop.unit === '%' ? (crop.x / 100) * img.width : crop.x) * scaleX
    const cropY = (crop.unit === '%' ? (crop.y / 100) * img.height : crop.y) * scaleY
    const cropW = (crop.unit === '%' ? (crop.width / 100) * img.width : crop.width) * scaleX
    const cropH = (crop.unit === '%' ? (crop.height / 100) * img.height : crop.height) * scaleY

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outputW, outputH)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        URL.revokeObjectURL(srcUrl)
        onCropped(blob)
      },
      'image/jpeg',
      0.92,
    )
  }, [crop, srcUrl, onCropped])

  function handleCancel() {
    URL.revokeObjectURL(srcUrl)
    onCancel()
  }

  return (
    <Modal open onClose={handleCancel} title="画像をトリミング">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          枠をドラッグして位置・サイズを調整してください（縦長4:3）
        </p>
        <div className="flex justify-center overflow-auto">
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={ASPECT} minWidth={50}>
            <img
              ref={imgRef}
              src={srcUrl}
              alt="トリミング対象"
              onLoad={handleImageLoad}
              style={{ maxHeight: '60vh', maxWidth: '100%' }}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button type="button" onClick={handleConfirm}>
            この範囲で確定
          </Button>
        </div>
      </div>
    </Modal>
  )
}
