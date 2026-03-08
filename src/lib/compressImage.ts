import imageCompression from 'browser-image-compression'

const COSTUME_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2560,
  useWebWorker: true,
}

const AVATAR_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 800,
  useWebWorker: true,
}

export async function compressCostumeImage(file: File): Promise<File> {
  return imageCompression(file, COSTUME_OPTIONS)
}

export async function compressAvatarBlob(blob: Blob): Promise<Blob> {
  const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
  const compressed = await imageCompression(file, AVATAR_OPTIONS)
  return compressed
}
