/**
 * SmartQR Weekly Cache Manager
 * Membersihkan cache browser & service worker setiap 7 hari (mingguan)
 * agar memory dan storage HP / browser pelanggan & admin tidak penuh.
 */

const CACHE_CLEANUP_KEY = 'smartqr_last_weekly_cache_cleanup'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000 // 7 hari

export async function checkAndCleanupWeeklyCache(): Promise<{
  cleaned: boolean
  message?: string
}> {
  try {
    const lastCleanupStr = localStorage.getItem(CACHE_CLEANUP_KEY)
    const now = Date.now()

    if (lastCleanupStr) {
      const lastCleanup = parseInt(lastCleanupStr, 10)
      if (!isNaN(lastCleanup) && now - lastCleanup < ONE_WEEK_MS) {
        // Belum genap seminggu, tidak perlu dibersihkan
        return { cleaned: false }
      }
    }

    // Jalankan pembersihan cache mingguan
    await clearExpiredMediaCaches()
    localStorage.setItem(CACHE_CLEANUP_KEY, now.toString())
    console.info('[CacheManager] Pembersihan cache mingguan berhasil dijalankan.')
    return { cleaned: true, message: 'Cache mingguan berhasil dibersihkan.' }
  } catch (err) {
    console.warn('[CacheManager] Gagal membersihkan cache mingguan:', err)
    return { cleaned: false }
  }
}

/**
 * Hapus cache media / font / storage lama dari browser CacheStorage API
 */
export async function clearExpiredMediaCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      for (const name of cacheNames) {
        // Hapus cache yang berhubungan dengan media, storage, atau runtime lama
        if (
          name.includes('media-cache') ||
          name.includes('storage-media-cache') ||
          name.includes('images') ||
          name.includes('runtime')
        ) {
          await caches.delete(name)
        }
      }
    } catch (e) {
      console.warn('[CacheManager] Gagal menghapus cache storage:', e)
    }
  }
}

/**
 * Hapus seluruh cache secara manual jika diminta
 */
export async function clearAllAppCaches(): Promise<boolean> {
  try {
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n)))
    }
    localStorage.setItem(CACHE_CLEANUP_KEY, Date.now().toString())
    return true
  } catch (err) {
    console.error('[CacheManager] Gagal membersihkan seluruh cache:', err)
    return false
  }
}
