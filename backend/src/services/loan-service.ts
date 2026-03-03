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

export const createLoan = async (userIdentifier: string, bookId: string, staffId: string): Promise<Loan> => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  // 1. Resolve User (Could be UUID, Student ID, or Email)
  let { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, student_id, email')
    .or(`id.eq.${userIdentifier},student_id.eq.${userIdentifier},email.eq.${userIdentifier}`)
    .single()

  if (!profile) {
    throw new Error('ไม่พบข้อมูลผู้ใช้เป้าหมาย (กรุณาเช็ค ID, รหัสนักศึกษา หรือ อีเมล)')
  }

  const userId = profile.id;
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

  // 2. Resolve Book (Could be UUID or ISBN)
  let { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('id, available_copies, isbn')
    .or(`id.eq.${bookId},isbn.eq.${bookId},isbn.eq.${bookId.replace(/[-\s]/g, '')}`)
    .single()

  if (!book) {
    throw new Error('ไม่พบข้อมูลหนังสือ (กรุณาเช็ค ID หรือ ISBN)')
  }

  if (book.available_copies <= 0) {
    throw new Error('หนังสือไม่เหลือให้ยืม')
  }

  const resolvedBookId = book.id;

  const { error: updateBookError } = await supabaseAdmin
    .from('books')
    .update({
      available_copies: book.available_copies - 1
    })
    .eq('id', resolvedBookId)

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
      book_id: resolvedBookId,
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

  // 3. Handle Reservations: Check if anyone is waiting for this book
  try {
    const { data: nextReservation } = await supabaseAdmin
      .from('reservations')
      .select('id, user_id, book:books(title)')
      .eq('book_id', loan.book_id)
      .eq('status', 'pending')
      .order('reserved_at', { ascending: true })
      .limit(1)
      .single();

    if (nextReservation) {
      // Notify the person who reserved it
      await createNotification(supabaseAdmin as any, {
        userId: nextReservation.user_id,
        type: 'reservation_ready',
        message: `หนังสือ "${(nextReservation.book as any).title}" ที่คุณจองไว้ คืนเข้าระบบแล้วและพร้อมให้คุณมารับ!`
      });

      // Update reservation status to ready
      await supabaseAdmin
        .from('reservations')
        .update({ status: 'ready' })
        .eq('id', nextReservation.id);
    }
  } catch (resvErr) {
    // Ignore if no reservations or error
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

export const renewLoanByStaff = async (loanId: string, newDueDate: string, staffId: string): Promise<Loan> => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { data: loan, error: fetchError } = await supabaseAdmin
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .single()

  if (fetchError || !loan) {
    throw new Error("ไม่พบรายการยืมที่ระบุ")
  }

  const { data, error: updateError } = await supabaseAdmin
    .from('loans')
    .update({
      due_date: newDueDate,
      issued_by: staffId // บันทึกว่า Staff คนไหนต่ออายุ (จริงๆ ควรมี column منفصل แต่ใช้ column นี้ชั่วคราวได้)
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
  const { data: loansData, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId)
    .order('loan_date', { ascending: false })

  if (error) {
    throw new Error("ไม่สามารถดึงข้อมูลการยืมได้")
  }

  if (!loansData || loansData.length === 0) {
    return []
  }

  const bookIds = [...new Set(loansData.map((l: any) => l.book_id))]

  const { data: booksData } = await supabase
    .from('books')
    .select('id, title, author')
    .in('id', bookIds)

  const bookMap = new Map(booksData?.map(b => [b.id, b]))

  const merged = loansData.map((loan: any) => ({
    ...loan,
    books: bookMap.get(loan.book_id) || null
  }))

  return merged
}

export const getAllLoansInSystem = async (): Promise<Loan[]> => {
  const { data: loansData, error: loansError } = await supabase
    .from('loans')
    .select('*')
    .order('due_date', { ascending: true })

  if (loansError) {
    console.error('GetAllLoansInSystem Error:', loansError)
    throw new Error("ไม่สามารถดึงข้อมูลรายการยืมทั้งหมดได้: " + loansError.message)
  }

  if (!loansData || loansData.length === 0) {
    return []
  }

  const userIds = [...new Set(loansData.map(l => l.user_id))]
  const bookIds = [...new Set(loansData.map(l => l.book_id))]

  const [usersRes, booksRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role, email, is_active').in('id', userIds),
    supabase.from('books').select('id, title').in('id', bookIds)
  ])

  const userMap = new Map(usersRes.data?.map(u => [u.id, u]))
  const bookMap = new Map(booksRes.data?.map(b => [b.id, b]))

  const merged = loansData.map((loan: any) => ({
    ...loan,
    user: userMap.get(loan.user_id) || null,
    book: bookMap.get(loan.book_id) || null
  }))

  return merged as Loan[]
};

export const getLoanById = async (loanId: string): Promise<Loan | null> => {
  const { data: loan, error } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .single()

  if (error) {
    console.error('GetLoanById Error:', error)
    if (error.code === 'PGRST116') return null; // Not Found
    throw new Error(error.message)
  }

  if (!loan) return null;

  const [usersRes, booksRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role, email, is_active').eq('id', loan.user_id).single(),
    supabase.from('books').select('id, title, author, isbn, category, shelf_location').eq('id', loan.book_id).single()
  ])

  return {
    ...loan,
    user: usersRes.data || null,
    book: booksRes.data || null
  } as Loan
}
