import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load env from backend
dotenv.config({ path: path.join(__dirname, 'backend/.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables not found. Check backend/.env.development')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function forceAllOverdue() {
    console.log('--- FORCING ALL ACTIVE LOANS TO OVERDUE ---')

    // 1. Get all active loans
    const { data: loans, error: fetchError } = await supabase
        .from('loans')
        .select('id, due_date')
        .eq('status', 'active')

    if (fetchError) {
        console.error('Fetch error:', fetchError.message)
        return
    }

    if (!loans || loans.length === 0) {
        console.log('No active loans found in the system.')
        console.log('Please borrow a book first!')
        return
    }

    console.log(`Found ${loans.length} active loans. Updating all...`)

    const oldDate = '2020-01-01' // Very old date

    for (const loan of loans) {
        const { error: updateError } = await supabase
            .from('loans')
            .update({
                due_date: oldDate,
                status: 'overdue'
            })
            .eq('id', loan.id)

        if (updateError) {
            console.error(`Failed to update loan ${loan.id}:`, updateError.message)
        } else {
            console.log(`Loan ${loan.id} updated to OVERDUE (Due: ${oldDate})`)
        }
    }

    console.log('\n--- FINISHED ---')
    console.log('Please refresh your browser on the Loan Management page.')
}

forceAllOverdue()
