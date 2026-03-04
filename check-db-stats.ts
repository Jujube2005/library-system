import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, 'backend/.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkStats() {
    const { count: active } = await supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active');
    const { count: overdue } = await supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'overdue');
    const { data: all } = await supabase.from('loans').select('id, status, due_date');

    console.log('\n--- REAL DB STATS (Direct from Supabase) ---')
    console.log('Active:', active || 0)
    console.log('Overdue:', overdue || 0)
    console.log('\n--- Raw Data ---')
    console.table(all)
}
checkStats()
