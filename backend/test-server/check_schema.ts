import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function check() {
    console.log('--- Checking Reservations ---')
    const { data: resv, error: resvErr } = await supabase.from('reservations').select('*').limit(1)
    if (resvErr) console.error('Reservations error:', resvErr)
    else console.log('Reservations columns:', resv && resv.length > 0 ? Object.keys(resv[0]) : 'Empty table')

    console.log('--- Checking Fines ---')
    const { data: fines, error: fineErr } = await supabase.from('fines').select('*').limit(1)
    if (fineErr) console.error('Fines error:', fineErr)
    else console.log('Fines columns:', fines && fines.length > 0 ? Object.keys(fines[0]) : 'Empty table')
}

check()
