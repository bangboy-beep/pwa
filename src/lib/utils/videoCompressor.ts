/**
 * SmartQR Video Utility
 * - Menjaga video menu tetap tajam & optimal (hingga 5.0 MB)
 * - Ekstraksi poster thumbnail otomatis dari frame video (WebP)
 * - Kompresi video client-side berbasis Canvas & MediaRecorder
 */

export const MAX_SPECIAL_VIDEO_LIMIT = 5
export const MAX_VIDEO_FILE_SIZE = 5.0 * 1024 * 1024 // 5.0 MB
export const IDEAL_VIDEO_MIN_SIZE = 1.0 * 1024 * 1024 // 1.0 MB
export const MAX_VIDEO_DURATION_SECONDS = 8 // Maksimal 8 detik

/**
 * Ekstraksi frame pertama video menjadi gambar WebP (poster thumbnail)
 * Menghilangkan masalah layar hitam saat video sedang buffering.
 */
export async function extractVideoThumbnail(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl

    let resolved = false
    const finish = (result: File | null) => {
      if (resolved) return
      resolved = true
      URL.revokeObjectURL(objectUrl)
      resolve(result)
    }

    const timeout = setTimeout(() => finish(null), 5000)

    video.onloadedmetadata = () => {
      // Ambil frame awal (0.1s atau separuh durasi jika sangat pendek)
      video.currentTime = Math.min(0.15, (video.duration || 1) / 2)
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        const maxDim = 800
        const origW = video.videoWidth || 800
        const origH = video.videoHeight || 800
        const scale = Math.min(1, maxDim / Math.max(origW, origH))
        canvas.width = Math.round(origW * scale)
        canvas.height = Math.round(origH * scale)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          clearTimeout(timeout)
          finish(null)
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout)
            if (blob) {
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'video_poster'
              const posterFile = new File([blob], `${baseName}_poster.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
              finish(posterFile)
            } else {
              finish(null)
            }
          },
          'image/webp',
          0.82
        )
      } catch {
        clearTimeout(timeout)
        finish(null)
      }
    }

    video.onerror = () => {
      clearTimeout(timeout)
      finish(null)
    }
  })
}

/**
 * Kompresi video client-side menggunakan HTML5 Canvas + MediaRecorder
 * Mengubah video berukuran besar menjadi ~1.0 - 4.0 MB dengan resolusi optimal
 *
 * Strategi:
 * 1. Downscale ke 480p (cukup tajam untuk layar HP)
 * 2. Bitrate agresif 1.5 Mbps → auto-retry lebih rendah jika masih besar
 * 3. FPS 24 (standar sinema, hemat bandwidth)
 * 4. Timeout 30 detik untuk HP lambat
 */

// Single-pass encode helper
function _encodePass(
  file: File,
  bitrate: number,
  maxDim: number,
  fps: number
): Promise<{ file: File; compressed: boolean; savedPercent?: number }> {
  return new Promise((resolve) => {
    if (
      typeof window === 'undefined' ||
      !window.MediaRecorder ||
      !HTMLCanvasElement.prototype.captureStream
    ) {
      return resolve({ file, compressed: false })
    }

    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl

    let hasResolved = false
    const finish = (resultFile: File, wasCompressed: boolean) => {
      if (hasResolved) return
      hasResolved = true
      URL.revokeObjectURL(objectUrl)
      try { video.pause() } catch {}
      const savedPercent = wasCompressed
        ? Math.round(((file.size - resultFile.size) / file.size) * 100)
        : undefined
      resolve({ file: resultFile, compressed: wasCompressed, savedPercent })
    }

    // Timeout 30 detik untuk HP lambat
    const timer = setTimeout(() => finish(file, false), 30000)

    video.onloadedmetadata = () => {
      try {
        const canvas = document.createElement('canvas')
        const origW = video.videoWidth || 720
        const origH = video.videoHeight || 1280
        const scale = Math.min(1, maxDim / Math.max(origW, origH))
        canvas.width = Math.round(origW * scale)
        canvas.height = Math.round(origH * scale)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          clearTimeout(timer)
          finish(file, false)
          return
        }

        const stream = canvas.captureStream(fps)

        // Pilih codec terbaik yang tersedia
        let mimeType = 'video/webm;codecs=vp8'
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')) {
          mimeType = 'video/mp4;codecs=avc1.42E01E'
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9'
        } else if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''
        }

        const options: MediaRecorderOptions = {
          videoBitsPerSecond: bitrate,
        }
        if (mimeType) {
          options.mimeType = mimeType
        }

        const recorder = new MediaRecorder(stream, options)
        const chunks: Blob[] = []

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data)
        }

        recorder.onstop = () => {
          clearTimeout(timer)
          const outputMime = recorder.mimeType || 'video/mp4'
          const ext = outputMime.includes('webm') ? 'webm' : 'mp4'
          const blob = new Blob(chunks, { type: outputMime })
          if (blob.size < file.size && blob.size > 20000) {
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'video'
            const compressedFile = new File([blob], `${baseName}_optimized.${ext}`, {
              type: outputMime,
              lastModified: Date.now(),
            })
            finish(compressedFile, true)
          } else {
            finish(file, false)
          }
        }

        recorder.start(100)

        let isDrawing = true
        const renderLoop = () => {
          if (!isDrawing) return
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          if (!video.paused && !video.ended) {
            requestAnimationFrame(renderLoop)
          }
        }

        video.onplay = () => {
          renderLoop()
        }

        video.onended = () => {
          isDrawing = false
          setTimeout(() => {
            if (recorder.state === 'recording') {
              recorder.stop()
            }
          }, 150)
        }

        video.play().catch(() => {
          clearTimeout(timer)
          finish(file, false)
        })
      } catch {
        clearTimeout(timer)
        finish(file, false)
      }
    }

    video.onerror = () => {
      clearTimeout(timer)
      finish(file, false)
    }
  })
}

export async function compressVideoClient(
  file: File,
  targetBitrate = 1_500_000 // 1.5 Mbps — agresif tapi masih jernih di HP
): Promise<{ file: File; compressed: boolean; savedPercent?: number }> {
  // Jika file sudah <= 5.0 MB, tidak perlu kompres lagi
  if (file.size <= MAX_VIDEO_FILE_SIZE) {
    return { file, compressed: false }
  }

  // Pass 1: 480p, bitrate target (1.5 Mbps), 24 FPS
  const pass1 = await _encodePass(file, targetBitrate, 480, 24)
  if (pass1.compressed && pass1.file.size <= MAX_VIDEO_FILE_SIZE) {
    return pass1
  }

  // Pass 2: Lebih agresif — 360p, 800 Kbps, 20 FPS
  const pass2 = await _encodePass(file, 800_000, 360, 20)
  if (pass2.compressed && pass2.file.size <= MAX_VIDEO_FILE_SIZE) {
    return pass2
  }

  // Gagal kompres cukup kecil, kembalikan hasil terbaik yang ada
  if (pass1.compressed && pass1.file.size < file.size) return pass1
  if (pass2.compressed && pass2.file.size < file.size) return pass2
  return { file, compressed: false }
}
