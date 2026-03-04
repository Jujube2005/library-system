import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function checkColumns() {
    console.log('Testing column existence...')

    const { error: err1 } = await supabase.from('fines').select('user_id').limit(0)
    console.log('fines.user_id exists:', !err1)
    if (err1) console.log('fines error details:', err1)

    const { error: err2 } = await supabase.from('reservations').select('user_id').limit(0)
    console.log('reservations.user_id exists:', !err2)
    if (err2) console.log('reservations error details:', err2)
}

checkColumns()
