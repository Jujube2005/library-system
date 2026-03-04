import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkConstraints() {
    console.log('--- Checking Constraints on Fines table ---')
    const { data, error } = await supabase.rpc('get_table_constraints', { tname: 'fines' })

    if (error) {
        // If RPC doesn't exist, use raw query if possible, but let's try a simple select
        console.log('RPC not found, trying raw query via select...')
    }

    // Try to find if loan_id has a unique index
    const { data: cols, error: colErr } = await supabase.from('fines').select('*').limit(0)
    console.log('Columns:', Object.keys(cols?.[0] || {}))
}
checkConstraints()
