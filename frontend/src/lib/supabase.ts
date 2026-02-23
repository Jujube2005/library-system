import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '../environments'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
