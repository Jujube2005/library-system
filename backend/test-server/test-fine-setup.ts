import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function backdateLoan() {
    console.log('--- Checking for Active Loans to Test ---')

    // 1. Fetch only loan ID and due_date (no joins to avoid errors)
    const { data: loans, error: fetchError } = await supabase
        .from('loans')
        .select('id, due_date, status')
        .eq('status', 'active')
        .limit(1)

    if (fetchError) {
        console.error('❌ Fetch Error:', fetchError.message)
        return
    }

    if (!loans || loans.length === 0) {
        console.log('\n❌ ERROR: ไม่พบรายการยืมที่ยังไม่ได้คืนในระบบ (Active)')
        return
    }

    const loan = loans[0]
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - 5)
    const backdated = targetDate.toISOString().split('T')[0]

    console.log(`\nFound Loan ID: ${loan.id}`)
    console.log(`⏳ Updating Due Date to: ${backdated} and status to OVERDUE...`)

    const { error: updateError } = await supabase
        .from('loans')
        .update({
            due_date: backdated,
            status: 'overdue'
        })
        .eq('id', loan.id)

    if (updateError) {
        console.error('❌ Update failed:', updateError.message)
    } else {
        console.log('\n✅ DONE! สำเร็จแล้วครับ')
        console.log('1. กลับไปที่หน้าเว็บเมนู "Loan Management"')
        console.log('2. กดปุ่ม Refresh 🔄')
        console.log('3. จะเห็นรายการเป็นสีแดง "OVERDUE" แล้วครับ')
    }
}

backdateLoan()
