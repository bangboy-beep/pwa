// SmartQR Business Image Service
// Handles uploading banner (cover) and logo images to Supabase Storage

import { createClient } from '../supabase/client'
import { updateBusiness } from './service'

export async function uploadBusinessImage(
  businessId: string,
  file: File,
  type: 'logo' | 'cover'
): Promise<{ url: string | null; error: { message: string } | null }> {
  const supabase = createClient()

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
    return { url: null, error: { message: 'Format file harus berupa PNG, JPG, atau JPEG.' } }
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: { message: 'Ukuran file maksimal 5MB.' } }
  }

  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${businessId}/${type}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('business-images')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    return { url: null, error: { message: uploadError.message } }
  }

  const { data: publicUrlData } = supabase.storage
    .from('business-images')
    .getPublicUrl(fileName)

  const publicUrl = publicUrlData.publicUrl

  // Update business record in database
  const updatePayload = type === 'logo' ? { logo_url: publicUrl } : { cover_url: publicUrl }
  const { error: updateError } = await updateBusiness(businessId, updatePayload)

  if (updateError) {
    return { url: null, error: { message: updateError.message } }
  }

  return { url: publicUrl, error: null }
}
