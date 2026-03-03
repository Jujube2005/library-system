
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '.env') })

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkFines() {
    console.log('--- SCHEMA CHECK ---')
    const columns = ['paid_at', 'payment_date', 'status', 'amount', 'updated_at', 'created_at']
    for (const col of columns) {
        const { error } = await supabase.from('fines').select(col).limit(0)
        if (error) {
            console.log(`[ ] ${col}: MISSING (${error.message})`)
        } else {
            console.log(`[x] ${col}: EXISTS`)
        }
    }
}

checkFines().catch(console.error)
