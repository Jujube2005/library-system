import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function check() {
    const { data, error, count } = await supabase
        .from('books')
        .select('*', { count: 'exact' })

    if (error) {
        console.error('Error fetching books:', error)
    } else {
        console.log('Books found:', data?.length)
        console.log('Total count:', count)
        if (data && data.length > 0) {
            console.log('First book sample:', data[0])
        }
    }
}

check()
