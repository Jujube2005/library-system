import { createClient } from '@supabase/supabase-js'
import { supabase } from "../config/supabase"
import { env } from '../config/env'
import { createNotification } from './notification-service'
import { Loan } from '../types/loan'

const getLoanRulesForRole = (role: string) => {
  if (role === 'instructor') {
    return { maxLoans: 10, loanDays: 30 }
  }

  if (role === 'student') {
    return { maxLoans: 5, loanDays: 7 }
  }

  return { maxLoans: 5, loanDays: 7 }
}

export const createLoan = async (userId: string, bookId: string, staffId: string): Promise<Loan> => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('ไม่พบข้อมูลผู้ใช้เป้าหมาย')
  }

  const rules = getLoanRulesForRole(profile.role)

  const { count, error: countError } = await supabaseAdmin
    .from('loans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['active', 'overdue'])

  if (countError) {
    throw new Error('ไม่สามารถตรวจสอบจำนวนการยืมได้')
  }

  if ((count ?? 0) >= rules.maxLoans) {
    throw new Error('ถึงจำนวนการยืมสูงสุดตามสิทธิ์แล้ว')
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('id, available_copies')
    .eq('id', bookId)
    .single()

  if (bookError || !book) {
    throw new Error('ไม่พบข้อมูลหนังสือ')
  }

  if (book.available_copies <= 0) {
    throw new Error('หนังสือไม่เหลือให้ยืม')
  }

  const { error: updateBookError } = await supabaseAdmin
    .from('books')
    .update({
      available_copies: book.available_copies - 1
    })
    .eq('id', bookId)

  if (updateBookError) {
    throw new Error('ไม่สามารถอัปเดตจำนวนคงเหลือของหนังสือได้')
  }

  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + rules.loanDays)

  const { data, error } = await supabaseAdmin
    .from('loans')
    .insert([{
      user_id: userId,
      book_id: bookId,
      issued_by: staffId,
      loan_date: today.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
      status: 'active'
    }])
    .select()
    .single()

  if (error) {
    throw new Error('ไม่สามารถบันทึกการยืมได้')
  }

  return data
}

export const returnLoan = async (loanId: string): Promise<{ loan: Loan, fine: any }> => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { error: rpcError } = await supabaseAdmin
    .rpc('process_return', { p_loan_id: loanId })

  if (rpcError) {
    throw new Error('ไม่สามารถประมวลผลการคืนหนังสือได้')
  }

  const { data: loan, error: loanError } = await supabaseAdmin
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .single()

  if (loanError || !loan) {
    throw new Error('ไม่พบข้อมูลการยืมหลังคืนหนังสือ')
  }

  const { data: fine } = await supabaseAdmin
    .from('fines')
    .select('*')
    .eq('loan_id', loanId)
    .single()

  if (fine && fine.amount > 0) {
    const userId = loan.user_id as string | undefined

    if (userId) {
      try {
        await createNotification(supabaseAdmin as any, {
          userId,
          type: 'overdue_fine',
          message: `คุณมีค่าปรับ ${Number(fine.amount)} บาทจากการคืนหนังสือเกินกำหนด`
        })
      } catch {
      }
    }
  }

  return { loan, fine }
}

export const renewLoan = async (loanId: string, userId: string) => {
  const { data: loan, error: fetchError } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (fetchError || !loan) {
    throw new Error("ไม่พบรายการยืมที่สามารถต่ออายุได้")
  }

  const isOverdue = new Date(loan.due_date) < new Date()
  if (isOverdue) {
    throw new Error("ไม่สามารถต่ออายุได้เนื่องจากเกินกำหนดส่ง กรุณาติดต่อ Staff")
  }

  const currentDueDate = new Date(loan.due_date)
  currentDueDate.setDate(currentDueDate.getDate() + 14)

  const { data, error: updateError } = await supabase
    .from('loans')
    .update({
      due_date: currentDueDate.toISOString().slice(0, 10)
    })
    .eq('id', loanId)
    .select()
    .single()

  if (updateError) {
    throw new Error("ไม่สามารถต่ออายุการยืมได้")
  }

  return data
}

export const renewLoanByStaff = async (loanId: string, userId: string, staffId: string): Promise<Loan> => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { data: loan, error: fetchError } = await supabaseAdmin
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (fetchError || !loan) {
    throw new Error("ไม่พบรายการยืมที่สามารถต่ออายุได้")
  }

  const currentDueDate = new Date(loan.due_date)
  currentDueDate.setDate(currentDueDate.getDate() + 14) // ต่ออายุ 14 วัน

  const { data, error: updateError } = await supabaseAdmin
    .from('loans')
    .update({
      due_date: currentDueDate.toISOString().slice(0, 10),
      issued_by: staffId // บันทึกว่า Staff คนไหนต่ออายุ
    })
    .eq('id', loanId)
    .select()
    .single()

  if (updateError) {
    throw new Error("ไม่สามารถต่ออายุการยืมได้")
  }

  return data
}

export const getLoansByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      id,
      loan_date,
      due_date,
      return_date,
      status,
      books (
        id,
        title,
        author
      )
    `)
    .eq('user_id', userId)
    .order('loan_date', { ascending: false })

  if (error) {
    throw new Error("ไม่สามารถดึงข้อมูลการยืมได้")
  }

  return data
}

export const getAllLoansInSystem = async (): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      id,
      user_id,
      book_id,
      loan_date,
      due_date,
      return_date,
      status,
      user:profiles!loans_user_id_fkey (
        id,
        full_name,
        role,
        email,
        is_active
      ),
      book:books (
        title
      )
    `)
    .order('due_date', { ascending: true })

  if (error) {
    throw new Error("ไม่สามารถดึงข้อมูลรายการยืมทั้งหมดได้")
  }

  return data as Loan[]
};

export const getLoanById = async (loanId: string): Promise<Loan | null> => {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      id,
      user_id,
      book_id,
      loan_date,
      due_date,
      return_date,
      status,
      user:profiles!loans_user_id_fkey (
        id,
        full_name,
        role,
        email,
        is_active
      ),
      book:books (
        id,
        title,
        author,
        isbn,
        category,
        shelf_location
      )
    `)
    .eq('id', loanId)
    .single()

  if (error) {
    // ถ้าไม่พบ loan จะ return null แทนที่จะ throw error
    if (error.code === 'PGRST116') return null; // Not Found
    throw new Error(error.message)
  }

  return data as Loan
}