import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://awxfzihqptxtfuwlagwh.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eGZ6aWhxcHR4dGZ1d2xhZ3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTI5MTMsImV4cCI6MjA4MjAyODkxM30.3saG60SxTG8X4hc1Cu5IqAQEPxLfpKpODmT0aAjcWUs';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for authenticated users (uses anon key + user JWT)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

export { supabaseUrl, supabaseAnonKey };

// Types for database tables
export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface PetImage {
  id: number;
  user_id: string;
  original_url: string;
  thumbnail_url: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface Model3d {
  id: number;
  user_id: string;
  pet_image_id: number | null;
  job_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  glb_url: string | null;
  preview_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface PrintSize {
  id: number;
  name: string;
  description: string | null;
  dimensions: string | null;
  price_usd: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: string;
  model_3d_id: number | null;
  print_size_id: number;
  quantity: number;
  unit_price_usd: number;
  total_price_usd: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_country: string | null;
  shipping_postal_code: string | null;
  shipping_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  amount_usd: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payer_email: string | null;
  payer_id: string | null;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SystemConfig {
  id: number;
  config_key: string;
  config_value: string;
  description: string | null;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}
