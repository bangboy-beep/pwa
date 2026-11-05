// SmartQR Client-Side Menu Cache
// Menyimpan menu publik di browser (localStorage) dengan TTL (5–15 menit)
// Mengurangi 90%+ query ke database saat scan QR berulang / buka kategori

import type { Business, MenuCategory, MenuProduct } from '../../types'
import { createClient } from '../supabase/client'

export interface CachedMenuPayload {
  timestamp: number
  business: Business
  categories: MenuCategory[]
  products: MenuProduct[]
}

const CACHE_PREFIX = 'smartqr_menu_cache_'
export const DEFAULT_MENU_CACHE_TTL_MS = 10 * 60 * 1000 // 10 menit

/**
 * Mengambil menu dari localStorage jika ada.
 * Mengembalikan data dan status apakah cache sudah kadaluarsa (isStale).
 */
export function getCachedMenu(slug: string, ttlMs: number = DEFAULT_MENU_CACHE_TTL_MS): {
  data: CachedMenuPayload | null
  isStale: boolean
} {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${slug}`)
    if (!raw) return { data: null, isStale: true }

    const parsed: CachedMenuPayload = JSON.parse(raw)
    if (!parsed || !parsed.business || !parsed.timestamp) {
      return { data: null, isStale: true }
    }

    const age = Date.now() - parsed.timestamp
    const isStale = age > ttlMs
    return { data: parsed, isStale }
  } catch (err) {
    console.warn('[menuCache] Read cache failed:', err)
    return { data: null, isStale: true }
  }
}

/**
 * Menyimpan menu ke localStorage dengan timestamp sekarang.
 */
export function setCachedMenu(slug: string, payload: {
  business: Business
  categories: MenuCategory[]
  products: MenuProduct[]
}): void {
  try {
    const data: CachedMenuPayload = {
      ...payload,
      timestamp: Date.now(),
    }
    localStorage.setItem(`${CACHE_PREFIX}${slug}`, JSON.stringify(data))
  } catch (err) {
    console.warn('[menuCache] Write cache failed (quota exceeded?):', err)
  }
}

/**
 * Menghapus cache menu untuk slug tertentu (misal saat admin mengedit menu).
 */
export function clearCachedMenu(slug?: string): void {
  try {
    if (slug) {
      localStorage.removeItem(`${CACHE_PREFIX}${slug}`)
    } else {
      // Hapus semua cache menu smartqr
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    }
  } catch (err) {
    console.warn('[menuCache] Clear cache failed:', err)
  }
}

export interface FetchPublicMenuResult {
  business: Business | null
  categories: MenuCategory[]
  products: MenuProduct[]
  error: string | null
}

/**
 * Mengambil menu lengkap (Bisnis + Kategori + Produk) hanya dalam 1 KALI QUERY JOIN.
 * Menggantikan 3x query beruntun yang membebani database Supabase.
 */
export async function fetchPublicMenuSingleQuery(slug: string): Promise<FetchPublicMenuResult> {
  const supabase = createClient()
  try {
    // 1 kali query: join businesses -> menu_categories -> menu_products
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        menu_categories (
          *,
          menu_products!fk_menu_products_category_business (*)
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return {
        business: null,
        categories: [],
        products: [],
        error: error?.message || 'Bisnis tidak ditemukan atau belum aktif.',
      }
    }

    const payload = data as any
    const rawCategories = (payload.menu_categories || []) as any[]

    // Filter kategori aktif dan urutkan berdasarkan sort_order
    const categories: MenuCategory[] = rawCategories
      .filter((c) => c.is_active !== false)
      .map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { menu_products, ...cat } = c
        return cat as MenuCategory
      })
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

    // Flatten semua produk aktif dari setiap kategori dan urutkan berdasarkan sort_order
    const products: MenuProduct[] = rawCategories
      .filter((c) => c.is_active !== false)
      .flatMap((c) => (c.menu_products || []) as MenuProduct[])
      .filter((p) => p.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

    // Objek bisnis murni tanpa nested relations
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { menu_categories, ...businessData } = payload
    const business = businessData as Business

    return {
      business,
      categories,
      products,
      error: null,
    }
  } catch (err) {
    return {
      business: null,
      categories: [],
      products: [],
      error: err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat menu.',
    }
  }
}
