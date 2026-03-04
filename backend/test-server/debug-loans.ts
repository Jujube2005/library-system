import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function debugLoans() {
    console.log('--- Supabase URL:', supabaseUrl)
    console.log('--- Fetching ALL loans from database...')

    const { data, error } = await supabase
        .from('loans')
        .select('id, status, due_date, book_id, user_id')

    if (error) {
        console.error('Fetch Error:', error.message)
        return
    }

    if (!data || data.length === 0) {
        console.log('❌ No loans found at all in the "loans" table.')
        return
    }

    console.log(`✅ Found ${data.length} total loans:`)
    console.table(data)

    const activeLoans = data.filter(l => l.status === 'active')
    console.log(`\nActive Loans Count: ${activeLoans.length}`)

    if (activeLoans.length === 0) {
        const statuses = [...new Set(data.map(l => l.status))]
        console.log('Available statuses in DB:', statuses)
    }
}

debugLoans()
