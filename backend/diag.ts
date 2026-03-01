import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

app.get('/diag', async (req, res) => {
    try {
        const { data: books, error: booksError } = await supabase.from('books').select('*').limit(1)
        const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(1)
        const { data: reservations, error: reservationsError } = await supabase.from('reservations').select('*').limit(1)
        const { data: fines, error: finesError } = await supabase.from('fines').select('*').limit(1)

        res.json({
            books: { data: books, error: booksError },
            profiles: { data: profiles, error: profilesError },
            reservations: { data: reservations, error: reservationsError },
            fines: { data: fines, error: finesError }
        })
    } catch (err: any) {
        res.json({ error: err.message })
    }
})

app.listen(4001, () => {
    console.log('Diagnostic server running on http://localhost:4001')
})
