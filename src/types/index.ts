// SmartQR TypeScript Types

export type BusinessType =
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'homestay'
  | 'villa'
  | 'bar'
  | 'salon'
  | 'barbershop'
  | 'other'

export type UserRole = 'owner' | 'admin' | 'staff'

export type BusinessStatus = 'active' | 'inactive' | 'suspended'

export interface Business {
  id: string
  name: string
  slug: string
  business_type: BusinessType
  logo_url?: string
  cover_url?: string
  description?: string
  address?: string
  phone?: string
  whatsapp?: string
  google_maps_url?: string
  google_review_url?: string
  instagram_url?: string
  facebook_url?: string
  tiktok_url?: string
  website_url?: string
  opening_hours?: Record<string, string[]>
  theme?: BusinessTheme
  status: BusinessStatus
  created_at: string
  updated_at: string
}

export interface BusinessTheme {
  primary_color: string
  secondary_color: string
  button_style: 'rounded' | 'square' | 'pill'
  accent_color?: string
}

export interface BusinessMember {
  id: string
  business_id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  business_id: string
  name: string
  description?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuProduct {
  id: string
  business_id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  business_id: string
  title: string
  description?: string
  image?: string
  normal_price: number
  promo_price: number
  start_date: string
  end_date: string
  cta?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WiFiSettings {
  id: string
  business_id: string
  ssid: string
  password?: string
  security_type: 'WPA' | 'WEP' | 'nopass' | 'WPA2' | string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WiFiNetwork {
  id: string
  business_id: string
  name: string
  ssid: string
  password?: string
  security_type: 'WPA' | 'WEP' | 'nopass' | 'WPA2' | string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ReviewSettings {
  id: string
  business_id: string
  google_review_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  business_id: string
  event_type: string
  event_data?: Record<string, unknown>
  created_at: string
}

// Analytics event types
export type AnalyticsEventType =
  | 'page_view'
  | 'qr_scan'
  | 'menu_view'
  | 'wifi_view'
  | 'wifi_qr_view'
  | 'google_review_click'
  | 'whatsapp_click'
  | 'maps_click'
  | 'social_click'
  | 'promotion_view'
