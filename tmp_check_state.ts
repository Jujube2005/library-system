import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, 'backend/.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkAllLoans() {
    console.log('--- Current Database State (Loans) ---')
    const { data, error } = await supabase
        .from('loans')
        .select('id, status, due_date, loan_date, user_id, book_id')

    if (error) {
        console.error(error)
    } else {
        console.table(data)
    }
}
checkAllLoans()
