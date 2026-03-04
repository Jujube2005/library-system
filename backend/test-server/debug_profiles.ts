import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.development') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars', { supabaseUrl, hasKey: !!supabaseServiceKey })
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debug() {
    const { data: profiles, error } = await supabase.from('profiles').select('id, student_id, email, full_name')
    if (error) {
        console.error('Error fetching profiles:', error)
    } else {
        console.log('Profiles:')
        console.table(profiles)
    }
}

debug()
