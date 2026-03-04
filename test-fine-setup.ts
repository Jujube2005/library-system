import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load env from backend
dotenv.config({ path: path.join(__dirname, 'backend/.env.development') })

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables not found. Check backend/.env.development')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function backdateLoan() {
    console.log('--- Checking for Active Loans to Test ---')
    const { data: loans, error: fetchError } = await supabase
        .from('loans')
        .select('id, due_date, book:books(title), user:profiles(full_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

    if (fetchError || !loans || loans.length === 0) {
        console.log('\n❌ ERROR: ไม่พบรายการยืมที่ยังไม่ได้คืนในระบบ')
        console.log('💡 วิธีแก้: กรุณาลองไปที่แอป และทำการ "Record Loan" (ยืมหนังสือ) ให้สัก 1 รายการก่อน แล้วค่อยกลับมารันสคริปต์นี้ครับ')
        return
    }

    const loan = loans[0]

    // Set due date to 5 days ago (Overdue)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - 5)
    const backdated = targetDate.toISOString().split('T')[0]

    console.log(`\nFound Loan Details:`)
    console.log(`- Member: ${(loan as any).user?.full_name}`)
    console.log(`- Book: ${(loan as any).book?.title}`)
    console.log(`- Current Due Date: ${loan.due_date}`)
    console.log(`\n⏳ Updating Due Date to: ${backdated} (5 Days Overdue)...`)

    const { error: updateError } = await supabase
        .from('loans')
        .update({
            due_date: backdated,
            status: 'overdue'
        })
        .eq('id', loan.id)

    if (updateError) {
        console.error('Update failed:', updateError.message)
    } else {
        console.log('\n✅ UPDATE SUCCESSFUL!')
        console.log('-------------------------------------------')
        console.log('1. เข้าเว็บไปที่หน้า "Loan Management" กะดปุ่ม Refresh 🔄')
        console.log('2. รายการดังกล่าวควรจะเป็นสถานะ "OVERDUE" (ตัวสีแดง)')
        console.log('3. กดปุ่ม "คืนหนังสือ" (ไอคอน assignment_return ด้านขวาสุด)')
        console.log('4. ไปเช็คที่ตาราง "fines" ในฐานข้อมูล จะพบค่าปรับ 25 บาท!')
    }
}

backdateLoan()
