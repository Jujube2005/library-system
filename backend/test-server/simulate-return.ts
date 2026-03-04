import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function simulateReturn() {
    // Try to find an overdue loan to test with (or create one)
    const { data: loan } = await supabase.from('loans').select('*').eq('status', 'active').limit(1).single()

    if (!loan) {
        console.log('No active loans to test.')
        return
    }

    const loanId = loan.id
    console.log('Testing return for loan:', loanId)

    const today = new Date().toISOString().slice(0, 10)
    const dueDate = new Date(loan.due_date)
    const returnDate = new Date(today)

    const diffDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const overdueDays = Math.max(0, diffDays)
    const fineAmount = overdueDays * 5

    console.log(`Debug Info: Today: ${today}, Due: ${loan.due_date}, Diff: ${diffDays}, Fine: ${fineAmount}`)

    try {
        const { error: updErr } = await supabase.from('loans').update({ status: 'returned', return_date: today }).eq('id', loanId)
        if (updErr) throw updErr
        console.log('Loan status updated.')

        if (fineAmount > 0) {
            console.log('Creating fine...')
            const { data: fine, error: fErr } = await supabase.from('fines').upsert({
                loan_id: loanId,
                user_id: loan.user_id,
                amount: fineAmount,
                status: 'unpaid'
            }, { onConflict: 'loan_id' }).select().single()

            if (fErr) {
                console.error('Fine Error:', fErr.message, fErr.details)
            } else {
                console.log('Fine created:', fine.id)
            }
        }
    } catch (err: any) {
        console.error('Operation failed:', err.message)
    }
}

simulateReturn()
