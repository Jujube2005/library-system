import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function checkCommonNames() {
    const table = 'fines'
    const names = ['user_id', 'member_id', 'profile_id', 'student_id', 'id']

    console.log(`Checking columns for ${table}:`)
    for (const name of names) {
        const { error } = await supabase.from(table).select(name).limit(0)
        console.log(`- ${name}:`, !error ? 'EXISTS' : 'NOT FOUND')
    }

    console.log(`Checking columns for reservations:`)
    for (const name of names) {
        const { error } = await supabase.from('reservations').select(name).limit(0)
        console.log(`- ${name}:`, !error ? 'EXISTS' : 'NOT FOUND')
    }
}

checkCommonNames()
