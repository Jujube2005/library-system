import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function setupTestLoan() {
    const userId = 'b5cff582-a14e-40a4-8a62-c20b9ad50e36' // test test
    const bookId = '5d021899-d0c6-4bef-aa84-498a7ffc7fa5' // Intelligent Investor
    const staffId = userId

    const dueDate = '2026-02-27' // Overdue

    const { data, error } = await supabase.from('loans').insert({
        user_id: userId,
        book_id: bookId,
        issued_by: staffId,
        due_date: dueDate,
        status: 'active'
    }).select().single()

    if (error) {
        console.error('Setup failed:', error.message)
    } else {
        console.log('Test loan created:', data.id)
    }
}
setupTestLoan()
