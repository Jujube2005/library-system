import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey, apiBaseUrl } from '../environments'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getCurrentUser() {
  const res = await fetch(`${apiBaseUrl}/api/users/me`)
  return res.json()
}