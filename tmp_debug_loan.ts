import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: 'backend/.env' })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugLoan() {
    const loanId = '3bee192d-f758-49c2-9a25-461bfa1f1d19'

    console.log('Checking loan:', loanId)
    const { data: loan, error: loanErr } = await supabase.from('loans').select('*').eq('id', loanId).single()

    if (loanErr) {
        console.error('Loan error:', loanErr)
    } else {
        console.log('Loan data:', loan)
    }

    console.log('Testing RPC process_return...')
    const { error: rpcErr } = await supabase.rpc('process_return', { p_loan_id: loanId })

    if (rpcErr) {
        console.error('RPC Error:', rpcErr)
    } else {
        console.log('RPC Success')
    }
}

debugLoan()
