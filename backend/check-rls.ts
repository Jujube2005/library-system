import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkRLS() {
    const anonClient = createClient(process.env['SUPABASE_URL']!, process.env['SUPABASE_ANON_KEY']!)

    const { data: loans, error: loanErr } = await anonClient.from('loans').select('id').limit(1)
    console.log('Anon Query Loans:', loans?.length, loanErr?.message)

    const { data: fines, error: fineErr } = await anonClient.from('fines').select('id').limit(1)
    console.log('Anon Query Fines:', fines?.length, fineErr?.message)
}
checkRLS()
