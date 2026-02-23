import axios from 'axios'
import { supabase } from '../config/supabase'

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
