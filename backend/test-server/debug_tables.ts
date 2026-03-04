import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function debug() {
    const tables = ['profiles', 'books', 'loans', 'fines', 'reservations']

    for (const table of tables) {
        console.log(`--- Table: ${table} ---`)
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
            console.error(`Error selecting from ${table}:`, error)
        } else {
            console.log(`Success! Columns:`, data.length > 0 ? Object.keys(data[0]) : 'No data to determine columns')
        }
    }
}

debug()
