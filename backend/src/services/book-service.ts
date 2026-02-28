import axios from 'axios'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'
import { env } from '../config/env'
import { Book } from '../types/book'

// Original functions
export const searchBooksFromAPI = async (query: string) => {
    const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`
    )

    return response.data.items.map((book: any) => ({
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        thumbnail: book.volumeInfo.imageLinks?.thumbnail
    }))
}

export const getBookStatusById = async (bookId: string) => {
    const { data, error } = await supabase
        .from('books')
        .select('id, title, status, due_date')
        .eq('id', bookId)
        .single()

    if (error) throw new Error(error.message)
    return data
}

export const checkAvailability = async (bookId: string) => {
    const { data, error } = await supabase
        .from('books')
    .select('status, available_copies, total_copies')
        .eq('id', bookId)
        .single()

    if (error || !data) throw new Error('Book not found')

  const isAvailable = data.status === 'available' && (data as any).available_copies > 0

    return {
        bookId,
        isAvailable,
        remaining: (data as any).available_copies,
        message: isAvailable ? 'Ready to borrow' : 'Currently unavailable'
    }
}

export const reserveBook = async (userId: string, bookId: string) => {
    const { data: availability } = await supabase
        .from('books')
    .select('status, available_copies')
        .eq('id', bookId)
        .single()

    if (!availability) {
        throw new Error('Book not found')
    }

    if (!(availability.status === 'available' && (availability as any).available_copies > 0)) {
        throw new Error('Book is not available for reservation')
    }

    const { data, error } = await supabase
        .from('reservations')
        .insert({
            user_id: userId,
            book_id: bookId
        })
        .select('id, status, reserved_at')
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}


export const cancelReservation = async (bookId: string, userId: string) => {
  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('id, user_id')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .single()

  if (error || !reservation) {
    throw new Error("ไม่พบการจองที่สามารถยกเลิกได้")
  }

  const { error: deleteError } = await supabase
    .from('reservations')
    .delete()
    .eq('id', (reservation as any).id)

  if (deleteError) {
    throw new Error("ไม่สามารถยกเลิกการจองได้")
  }

  return { deleted: true }
}


export const borrowBook = async (bookId: string, userId: string) => {
  throw new Error("borrowBook is deprecated. กรุณาใช้ /api/loans ผ่าน Staff แทน")
}

export const returnBookLogic = async (borrowId: string, userId: string) => {
  throw new Error("returnBookLogic is deprecated. กรุณาใช้ /api/loans/:id/return ผ่าน Staff แทน")
}

export const calculateDueDate = (role: string) => {
  if (role === 'Instructor') return 30; // อาจารย์ยืมได้ 30 วัน
  if (role === 'Student') return 7;     // นักเรียนยืมได้ 7 วัน
  return 0;
};

// New Staff functions
export const createBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { data, error } = await supabaseAdmin
    .from('books')
    .insert({
      ...bookData,
      available_copies: bookData.total_copies,
      status: bookData.total_copies > 0 ? 'available' : 'unavailable'
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updateBookInfo = async (bookId: string, updateData: Partial<Book>) => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { data, error } = await supabaseAdmin
    .from('books')
    .update(updateData)
    .eq('id', bookId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const deleteBook = async (bookId: string) => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { data: loans, error: loanError } = await supabaseAdmin
    .from('loans')
    .select('id')
    .eq('book_id', bookId)
    .neq('status', 'returned')

  if (loanError) throw new Error(loanError.message)
  if (loans && loans.length > 0) {
    throw new Error('ไม่สามารถลบหนังสือได้ เนื่องจากมีการยืมหรือจองค้างอยู่')
  }

  const { error } = await supabaseAdmin
    .from('books')
    .delete()
    .eq('id', bookId)

  if (error) {
    throw new Error(error.message)
  }

  return { message: 'ลบหนังสือสำเร็จ' }
}

export const updateBookCopies = async (bookId: string, change: number) => {
  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey as string)

  const { data: currentBook, error: fetchError } = await supabaseAdmin
    .from('books')
    .select('total_copies, available_copies')
    .eq('id', bookId)
    .single()

  if (fetchError) throw new Error(fetchError.message)
  if (!currentBook) throw new Error('ไม่พบหนังสือ')

  const newTotalCopies = currentBook.total_copies + change
  if (newTotalCopies < 0) {
    throw new Error('จำนวนสำเนาทั้งหมดไม่สามารถน้อยกว่า 0 ได้')
  }

  const borrowedCopies = currentBook.total_copies - currentBook.available_copies
  const newAvailableCopies = newTotalCopies - borrowedCopies

  if (newAvailableCopies < 0) {
    throw new Error('จำนวนสำเนาที่ว่างไม่สามารถน้อยกว่าจำนวนที่ถูกยืมอยู่ได้')
  }

  const { data, error } = await supabaseAdmin
    .from('books')
    .update({
      total_copies: newTotalCopies,
      available_copies: newAvailableCopies,
      status: newTotalCopies > 0 ? 'available' : 'unavailable'
    })
    .eq('id', bookId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}