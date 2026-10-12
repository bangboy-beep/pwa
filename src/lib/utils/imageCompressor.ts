/**
 * SmartQR Client-side Image Compression Utility
 * Mengompresi gambar di browser menggunakan HTML5 Canvas
 * Menghasilkan format WebP/JPEG berukuran hemat (~100-250 KB) tanpa pecah di layar.
 */

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputType?: 'image/webp' | 'image/jpeg'
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    outputType = 'image/webp',
  } = options

  // Jika bukan gambar raster biasa (misal SVG atau GIF animasi), jangan diubah
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Hitung proporsi resize jika dimensi melebihi batas
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        // Gambar ulang di canvas dengan resolusi optimal
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }

            const ext = outputType === 'image/webp' ? 'webp' : 'jpg'
            const baseName =
              file.name.substring(0, file.name.lastIndexOf('.')) || 'image'
            const compressedFile = new File([blob], `${baseName}.${ext}`, {
              type: outputType,
              lastModified: Date.now(),
            })

            // Jika hasil kompresi ternyata lebih besar dari file asli (kasus gambar sangat kecil),
            // pakai file asli
            if (compressedFile.size >= file.size) {
              resolve(file)
            } else {
              resolve(compressedFile)
            }
          },
          outputType,
          quality
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
