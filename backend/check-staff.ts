import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkStaff() {
    const { data: staff } = await supabase.from('profiles').select('*').eq('role', 'staff')
    console.log('Staff List:', staff)

    const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student')
    console.log('Student List Count:', students?.length)
}
checkStaff()
