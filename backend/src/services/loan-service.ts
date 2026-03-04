import { createClient } from '@supabase/supabase-js'
import { supabase } from "../config/supabase"
import { supabaseAdmin } from '../config/supabase-admin'
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
  // 1. Resolve User (Could be UUID, Student ID, or Email)
  const isUserUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdentifier);
  const userQuery = isUserUUID
    ? `id.eq.${userIdentifier},student_id.eq.${userIdentifier},email.eq.${userIdentifier}`
    : `student_id.eq.${userIdentifier},email.eq.${userIdentifier}`;

  let { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, student_id, email')
    .or(userQuery)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile fetch error:', profileError);
  }

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
  const isBookUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);
  const cleanIsbn = bookId.replace(/[-\s]/g, '');
  const bookQuery = isBookUUID
    ? `id.eq.${bookId},isbn.eq.${bookId},isbn.eq.${cleanIsbn}`
    : `isbn.eq.${bookId},isbn.eq.${cleanIsbn}`;

  let { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('id, available_copies, isbn')
    .or(bookQuery)
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

  // Cancel any active/pending reservations for this user and this book
  try {
    const { data: reservation } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', resolvedBookId)
      .in('status', ['pending', 'active'])
      .single();

    if (reservation) {
      await supabaseAdmin
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', reservation.id);
    }
  } catch (resErr) {
    // Ignore error if no pending reservation
  }

  return data
}

export const returnLoan = async (loanId: string): Promise<{ loan: Loan, fine: any }> => {
  // 1. Fetch current loan data
  const { data: loan, error: loanError } = await supabaseAdmin
    .from('loans')
    .select('*, book:books(total_copies, available_copies)')
    .eq('id', loanId)
    .single()

  if (loanError || !loan) {
    throw new Error('ไม่พบข้อมูลการยืม')
  }

  if (loan.status === 'returned') {
    throw new Error('หนังสือเล่มนี้ถูกคืนไปแล้ว')
  }

  const today = new Date().toISOString().slice(0, 10)
  const dueDate = new Date(loan.due_date)
  const returnDate = new Date(today)

  // 2. Process Return in JS
  // Update Loan
  const { error: updateLoanError } = await supabaseAdmin
    .from('loans')
    .update({
      return_date: today,
      status: 'returned'
    })
    .eq('id', loanId)

  if (updateLoanError) {
    throw new Error('ไม่สามารถอัปเดตสถานะการยืมได้: ' + updateLoanError.message)
  }

  // Update Book Stock
  const book = (loan as any).book
  if (book) {
    const newAvailable = Math.min(book.available_copies + 1, book.total_copies)
    await supabaseAdmin
      .from('books')
      .update({ available_copies: newAvailable, status: 'available' })
      .eq('id', loan.book_id)
  }

  // Calculate Fine
  let fine = null
  const diffTime = returnDate.getTime() - dueDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const overdueDays = Math.max(0, diffDays)
  const fineAmount = overdueDays * 5

  if (fineAmount > 0) {
    try {
      // Check if fine already exists to avoid conflict errors
      const { data: existingFine } = await supabaseAdmin
        .from('fines')
        .select('id')
        .eq('loan_id', loanId)
        .single()

      if (existingFine) {
        const { data } = await supabaseAdmin
          .from('fines')
          .update({ amount: fineAmount, status: 'unpaid' })
          .eq('id', existingFine.id)
          .select().single()
        fine = data
      } else {
        const { data } = await supabaseAdmin
          .from('fines')
          .insert({ loan_id: loanId, user_id: loan.user_id, amount: fineAmount, status: 'unpaid' })
          .select().single()
        fine = data
      }

      if (fine) {
        await createNotification(supabaseAdmin as any, {
          userId: loan.user_id,
          type: 'overdue_fine',
          message: `คุณมีค่าปรับ ${Number(fine.amount)} บาทจากการคืนหนังสือเกินกำหนด`
        }).catch(() => { })
      }
    } catch (fineErr: any) {
      console.error('[ERR] Fine process failed:', fineErr.message)
    }
  }

  // 3. Handle Reservations
  try {
    const { data: nextReservation } = await supabaseAdmin
      .from('reservations')
      .select('id, user_id, book:books(title)')
      .eq('book_id', loan.book_id)
      .in('status', ['pending', 'active'])
      .order('reserved_at', { ascending: true })
      .limit(1)
      .single();

    if (nextReservation) {
      await createNotification(supabaseAdmin as any, {
        userId: nextReservation.user_id,
        type: 'reservation_ready',
        message: `หนังสือ "${(nextReservation.book as any).title}" ที่คุณจองไว้ พร้อมให้คุณมารับแล้ว!`
      }).catch(() => { });

      await supabaseAdmin.from('reservations').update({ status: 'ready' }).eq('id', nextReservation.id);
    }
  } catch (resvErr) { }

  // Fetch updated loan
  const { data: finalLoan } = await supabaseAdmin.from('loans').select('*').eq('id', loanId).single();

  return { loan: finalLoan || loan, fine }
}

export const renewLoan = async (loanId: string, userId: string) => {
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

  const isOverdue = new Date(loan.due_date) < new Date()
  if (isOverdue) {
    throw new Error("ไม่สามารถต่ออายุได้เนื่องจากเกินกำหนดส่ง กรุณาติดต่อ Staff")
  }

  const currentDueDate = new Date(loan.due_date)
  currentDueDate.setDate(currentDueDate.getDate() + 14)

  const { data, error: updateError } = await supabaseAdmin
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
  const { data: loansData, error } = await supabaseAdmin
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

  const { data: booksData } = await supabaseAdmin
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

export const getLoanStats = async () => {
  const { count: activeCount } = await supabaseAdmin.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active');
  const { count: overdueCount } = await supabaseAdmin.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'overdue');

  const today = new Date().toISOString().split('T')[0];
  const { count: returnedCount } = await supabaseAdmin.from('loans')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'returned')
    .gte('return_date', `${today}T00:00:00`);

  return {
    active: activeCount || 0,
    overdue: overdueCount || 0,
    returnedToday: returnedCount || 0
  };
};

export const getAllLoansInSystem = async (options?: { status?: string, limit?: number }): Promise<Loan[]> => {
  let query = supabaseAdmin
    .from('loans')
    .select('*')

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data: loansData, error: loansError } = await query
    .order('due_date', { ascending: true })
    .limit(options?.limit || 200) // Default to 200 for performance

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
    supabaseAdmin.from('profiles').select('id, full_name, role, email, is_active').in('id', userIds),
    supabaseAdmin.from('books').select('id, title').in('id', bookIds)
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
  const { data: loan, error } = await supabaseAdmin
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
    supabaseAdmin.from('profiles').select('id, full_name, role, email, is_active').eq('id', loan.user_id).single(),
    supabaseAdmin.from('books').select('id, title, author, isbn, category, shelf_location').eq('id', loan.book_id).single()
  ])

  return {
    ...loan,
    user: usersRes.data || null,
    book: booksRes.data || null
  } as Loan
}
