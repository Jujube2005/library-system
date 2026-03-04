import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function checkFunction() {
    try {
        const { data, error } = await supabase.from('users').select('id').limit(1)
        if (error) {
            console.log('Error checking users:', error.message)
        } else {
            console.log('Users table exists, first row:', JSON.stringify(data))
        }
    } catch (e: any) {
        console.log('Error:', e.message)
    }
}

checkFunction()
