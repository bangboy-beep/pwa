// SmartQR Menu Service
// Handles menu categories and products data fetching & mutations

import { createClient } from '../supabase/client'
import type { MenuCategory, MenuProduct } from '../../types'

const STORAGE_BUCKET = 'menu-images'

export async function getCategories(businessId: string): Promise<{
  data: MenuCategory[]
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })

  return { data: (data as MenuCategory[]) || [], error }
}

export async function createCategory(input: {
  business_id: string
  name: string
  description?: string
  sort_order?: number
  is_active?: boolean
}): Promise<{
  data: MenuCategory | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('menu_categories') as any)
    .insert({
      business_id: input.business_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  return { data: data as unknown as MenuCategory | null, error }
}

export async function updateCategory(
  id: string,
  businessId: string,
  updates: Partial<Omit<MenuCategory, 'id' | 'business_id' | 'created_at' | 'updated_at'>>
): Promise<{
  data: MenuCategory | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const payload: any = {}
  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.description !== undefined) payload.description = updates.description?.trim() || null
  if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order
  if (updates.is_active !== undefined) payload.is_active = updates.is_active

  const { data, error } = await (supabase.from('menu_categories') as any)
    .update(payload)
    .eq('id', id)
    .eq('business_id', businessId)
    .select()
    .single()

  return { data: data as unknown as MenuCategory | null, error }
}

export async function deleteCategory(id: string, businessId: string): Promise<{ error: { message: string } | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  return { error }
}

export async function getProducts(businessId: string): Promise<{
  data: MenuProduct[]
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_products')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })

  return { data: (data as MenuProduct[]) || [], error }
}

export async function createProduct(input: {
  business_id: string
  category_id: string
  name: string
  description?: string
  price: number
  sort_order?: number
  is_active?: boolean
  image_url?: string
}): Promise<{
  data: MenuProduct | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('menu_products') as any)
    .insert({
      business_id: input.business_id,
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
      image_url: input.image_url?.trim() || null,
    })
    .select()
    .single()

  return { data: data as unknown as MenuProduct | null, error }
}

export async function updateProduct(
  id: string,
  businessId: string,
  updates: Partial<Omit<MenuProduct, 'id' | 'business_id' | 'created_at' | 'updated_at'>>
): Promise<{
  data: MenuProduct | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const payload: any = {}
  if (updates.category_id !== undefined) payload.category_id = updates.category_id
  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.description !== undefined) payload.description = updates.description?.trim() || null
  if (updates.price !== undefined) payload.price = updates.price
  if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order
  if (updates.is_active !== undefined) payload.is_active = updates.is_active
  if (updates.image_url !== undefined) payload.image_url = updates.image_url?.trim() || null

  const { data, error } = await (supabase.from('menu_products') as any)
    .update(payload)
    .eq('id', id)
    .eq('business_id', businessId)
    .select()
    .single()

  return { data: data as unknown as MenuProduct | null, error }
}

export async function deleteProduct(id: string, businessId: string): Promise<{ error: { message: string } | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('menu_products')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  return { error }
}

export interface PublicMenuData {
  categories: MenuCategory[]
  products: MenuProduct[]
}

export async function getPublicMenu(businessId: string): Promise<{
  data: PublicMenuData | null
  error: { message: string } | null
}> {
  const supabase = createClient()

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      supabase
        .from('menu_categories')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('menu_products')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ])

    if (categoriesRes.error || productsRes.error) {
      return {
        data: null,
        error: {
          message: categoriesRes.error?.message || productsRes.error?.message || 'Gagal memuat menu',
        },
      }
    }

    const categories = (categoriesRes.data as MenuCategory[]) || []
    const rawProducts = (productsRes.data as MenuProduct[]) || []

    // Ensure products belong to active categories
    const activeCategoryIds = new Set(categories.map((c) => c.id))
    const products = rawProducts.filter((p) => activeCategoryIds.has(p.category_id))

    return {
      data: {
        categories,
        products,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Gagal memuat menu' },
    }
  }
}

export interface UploadImageResult {
  path: string | null
  url: string | undefined
  error: { message: string } | null
}

export async function uploadProductImage(
  businessId: string,
  productId: string,
  file: File
): Promise<UploadImageResult> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${businessId}/${productId}/${crypto.randomUUID()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, { upsert: false })

  if (uploadError) return { path: null, url: undefined, error: { message: uploadError.message } }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
  return { path: uploadData.path, url: urlData.publicUrl, error: null }
}

export async function deleteProductImage(businessId: string, productId: string): Promise<{ error: { message: string } | null }> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([`${businessId}/${productId}/*`])
  return { error }
}
