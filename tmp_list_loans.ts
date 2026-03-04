import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: 'backend/.env.development' })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function listLoans() {
    const { data, error } = await supabase.from('loans').select('id, status, book_id, user_id')
    if (error) {
        console.error(error)
    } else {
        console.log('Loans count:', data.length)
        console.log('Loans:', data)
    }
}
listLoans()
