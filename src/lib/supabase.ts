import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '../environments'

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
