import { createClient } from '../supabase/client'
import type { ReviewSettings } from '../../types'

export async function getReviewSettings(businessId: string): Promise<{
  data: ReviewSettings | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_reviews')
    .select('*')
    .eq('business_id', businessId)
    .single()

  return { data: data as ReviewSettings | null, error }
}

export async function updateReviewSettings(
  businessId: string,
  updates: Omit<ReviewSettings, 'id' | 'business_id' | 'created_at' | 'updated_at'>
): Promise<{
  data: ReviewSettings | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('business_reviews') as any)
    .upsert({
      business_id: businessId,
      google_review_url: updates.google_review_url.trim(),
      is_active: updates.is_active,
    })
    .select()
    .single()

  return { data: data as ReviewSettings | null, error }
}
