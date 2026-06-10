// Khởi tạo Supabase client để tương tác với dự án Supabase backend
// Sử dụng URL và Anon Key từ biến môi trường (.env.local)

import { createClient } from '@supabase/supabase-js'

let client = null

export function getSupabase() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing. Check .env.local file.')
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}
