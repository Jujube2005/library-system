import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, 'backend/.env') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfiles() {
    console.log('Checking profiles table...')
    const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Error fetching profiles:', error)
    } else {
        console.log('Successfully connected to profiles table. Count:', count)
    }
}

checkProfiles()
