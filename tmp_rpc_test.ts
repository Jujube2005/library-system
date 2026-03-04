import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: 'backend/.env' })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkRPC() {
    const loanId = '3bee192d-f758-49c2-9a25-461bfa1f1d19'
    console.log('Testing RPC...')
    const { data, error } = await supabase.rpc('process_return', { p_loan_id: loanId })
    if (error) {
        console.error('RPC Error details:', error.message, error.details, error.hint, error.code)
    } else {
        console.log('RPC result:', data)
    }
}
checkRPC()
