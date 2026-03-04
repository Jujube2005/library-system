import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkTable() {
    console.log('--- Checking table structure for fines ---')
    const { data, error } = await supabase.from('fines').select('*').limit(1)
    if (error) {
        console.error('Table Error:', error.message, error.code)
    } else {
        console.log('Table accessed successfully')
    }

    // Check categories enum or something? No.

    // Try to insert a dummy fine and see why it fails
    console.log('\n--- Testing manual insert to fines ---')
    const dummyLoanId = 'ece6a0dc-b87a-41a7-9e11-34193b243836'
    const dummyUserId = 'b5cff582-a14e-40a4-8a62-c20b9ad50e36' // from screenshot

    const { error: insErr } = await supabase.from('fines').insert({
        loan_id: dummyLoanId,
        user_id: dummyUserId,
        amount: 25,
        status: 'unpaid'
    })

    if (insErr) {
        console.error('Insert Error:', insErr.message, insErr.details, insErr.hint)
    } else {
        console.log('Insert success!')
    }
}
checkTable()
