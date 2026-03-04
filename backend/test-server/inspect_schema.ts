import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

async function inspectSchema() {
    const tables = ['profiles', 'books', 'loans', 'fines', 'reservations']
    const results: any = {}

    for (const table of tables) {
        const columnsToTest: string[] = [
            'id', 'created_at', 'updated_at', 'status', 'user_id', 'book_id',
            'loan_id', 'amount', 'paid_at', 'reserved_at', 'expires_at',
            'title', 'author', 'isbn', 'category', 'shelf_location', 'total_copies', 'available_copies',
            'full_name', 'email', 'role', 'is_active', 'student_id'
        ]

        const existingColumns: string[] = []

        for (const col of columnsToTest) {
            try {
                const { error: colErr } = await supabase.from(table).select(col).limit(0)
                if (!colErr) {
                    existingColumns.push(col)
                }
            } catch (e) { }
        }
        results[table] = existingColumns
    }
    console.log(JSON.stringify(results, null, 2))
}

inspectSchema().catch(console.error)
