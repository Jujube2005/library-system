import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function check() {
    const { data, error } = await supabase.rpc('get_policies') // This might not work if not defined
    if (error) {
        // Try querying pg_policies via SQL if we have service role, but we don't necessarily.
        // Let's just try to select from a table with/without a token.
        console.log('Testing public access to books...')
        const { data: pData, error: pErr } = await supabase.from('books').select('id').limit(1)
        if (pErr) console.error('Public access error:', pErr)
        else console.log('Public access success, found:', pData?.length)
    }
}

check()
