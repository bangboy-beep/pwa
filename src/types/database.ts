// SmartQR Database Types
// Matches supabase/migrations/001_initial_schema.sql and 002_menu_schema.sql

// Simple Json type for Supabase JSON columns
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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

export type BusinessStatus = 'active' | 'inactive' | 'suspended'
export type UserRole = 'owner' | 'admin' | 'staff'

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          slug: string
          business_type: BusinessType
          logo_url: string | null
          cover_url: string | null
          description: string | null
          address: string | null
          phone: string | null
          whatsapp: string | null
          google_maps_url: string | null
          google_review_url: string | null
          instagram_url: string | null
          facebook_url: string | null
          tiktok_url: string | null
          website_url: string | null
          opening_hours: Json | null
          theme: Json | null
          status: BusinessStatus
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Row']>
      }
      business_members: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_members']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['business_members']['Row']>
      }
      super_admins: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['super_admins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['super_admins']['Row']>
      }
      menu_categories: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['menu_categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['menu_categories']['Row']>
      }
      menu_products: {
        Row: {
          id: string
          business_id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['menu_products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['menu_products']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: {
      is_business_member: {
        Args: { p_business_id: string }
        Returns: boolean
      }
      get_business_role: {
        Args: { p_business_id: string }
        Returns: UserRole
      }
      is_super_admin: {
        Args: { p_email: string }
        Returns: boolean
      }
    }
    Enums: {
      business_type_enum: BusinessType
      business_status_enum: BusinessStatus
      user_role_enum: UserRole
    }
    CompositeTypes: Record<string, never>
  }
}
