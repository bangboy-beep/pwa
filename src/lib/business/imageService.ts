// SmartQR Business Image Service
// Handles uploading banner (cover) and logo images to Supabase Storage

import { createClient } from '../supabase/client'
import { updateBusiness } from './service'
import { compressImage } from '../utils/imageCompressor'

export async function uploadBusinessImage(
  businessId: string,
  file: File,
  type: 'logo' | 'cover'
): Promise<{ url: string | null; error: { message: string } | null }> {
  const supabase = createClient()

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
    return { url: null, error: { message: 'Format file harus berupa PNG, JPG, JPEG, atau WebP.' } }
  }

  // Validate file size (max 10MB sebelum kompres)
  if (file.size > 10 * 1024 * 1024) {
    return { url: null, error: { message: 'Ukuran file maksimal 10MB.' } }
  }

  // Kompresi otomatis gambar logo / cover
  let uploadFile = file
  try {
    uploadFile = await compressImage(file, {
      maxWidth: type === 'logo' ? 600 : 1400,
      maxHeight: type === 'logo' ? 600 : 900,
      quality: 0.82,
    })
  } catch {
    uploadFile = file
  }

  const fileExt = uploadFile.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg')
  const fileName = `${businessId}/${type}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('business-images')
    .upload(fileName, uploadFile, { upsert: true })

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
