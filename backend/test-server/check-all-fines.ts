import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkAllFines() {
    const { data: fines } = await supabase.from('fines').select('*')
    if (!fines || fines.length === 0) {
        console.log('NO FINES FOUND')
    } else {
        for (const f of fines) {
            console.log(`ID: ${f.id} | Amt: ${f.amount} | Status: ${f.status} | UserId: ${f.user_id}`)
        }
    }
}
checkAllFines()
