import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkFineFailure() {
    const loanId = 'ece6a0dc-b87a-41a7-9e11-34193b243836'
    console.log('--- Checking Loan Result for ID:', loanId)

    const { data: loan } = await supabase.from('loans').select('*').eq('id', loanId).single()
    console.log('Loan Status:', loan?.status)
    console.log('Loan Return Date:', loan?.return_date)

    console.log('\n--- Checking Fines table for this loan ---')
    const { data: fine, error: fineErr } = await supabase.from('fines').select('*').eq('loan_id', loanId)

    if (fineErr) {
        console.error('Fine Fetch Error:', fineErr.message)
    } else {
        console.log('Fine Record:', fine)
    }

    // Also check all fines to see if any exist
    const { count } = await supabase.from('fines').select('id', { count: 'exact', head: true })
    console.log('\nTotal Fines in DB:', count)
}
checkFineFailure()
