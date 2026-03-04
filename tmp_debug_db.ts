import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), 'backend', '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debug() {
    console.log('--- Reservations Columns ---')
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'reservations' })
    if (error) {
        // If RPC doesn't exist, try a simple select
        const { data: cols, error: err2 } = await supabase.from('reservations').select('*').limit(1)
        if (err2) console.error(err2)
        else console.log(Object.keys(cols[0] || {}))
    } else {
        console.log(data)
    }

    console.log('--- Trying to list all FKs for reservations ---')
    const { data: fks, error: fkErr } = await supabase.from('reservations').select(`
    *,
    user_id(*),
    book_id(*)
  `).limit(1)

    if (fkErr) console.log('FK error:', fkErr.message)
    else console.log('FK success')
}

debug()
