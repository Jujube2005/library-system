import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function diag() {
    console.log('--- Database Diagnostics ---')
    const { count, error: fineCountErr } = await supabase.from('fines').select('*', { count: 'exact', head: true })
    console.log('Fines Count:', count, fineCountErr ? `Error: ${fineCountErr.message}` : '(OK)')

    const { data: fines, error: finesErr } = await supabase.from('fines').select('id, status, amount, user_id')
    if (finesErr) console.error('Fines Query Error:', finesErr.message)
    else console.log('Fines Data:', fines)

    const { data: profiles, error: profErr } = await supabase.from('profiles').select('id, full_name, role')
    console.log('Total Profiles:', profiles?.length, profErr ? profErr.message : '')
}
diag()
