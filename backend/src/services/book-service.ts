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
        .select('status, stock_count')
        .eq('id', bookId)
        .single()

    if (error || !data) throw new Error('Book not found')

    const isAvailable = data.status === 'available' && data.stock_count > 0

    return {
        bookId,
        isAvailable,
        remaining: data.stock_count,
        message: isAvailable ? 'Ready to borrow' : 'Currently unavailable'
    }
}

export const reserveBook = async (userId: string, bookId: string) => {
    const { data: availability } = await supabase
        .from('books')
        .select('status, stock_count')
        .eq('id', bookId)
        .single()

    if (!availability) {
        throw new Error('Book not found')
    }

    if (!(availability.status === 'available' && availability.stock_count > 0)) {
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
  
  const { data: book, error: fetchError } = await supabase
    .from('books')
    .select('reserved_by, status')
    .eq('id', bookId)
    .single();

  if (fetchError || !book) throw new Error("ไม่พบข้อมูลหนังสือ");
  
  if (book.status !== 'reserved' || book.reserved_by !== userId) {
    throw new Error("คุณไม่มีสิทธิ์ยกเลิกการจองนี้ หรือหนังสือไม่ได้อยู่ในสถานะถูกจอง");
  }


  const { data, error: updateError } = await supabase
    .from('books')
    .update({ 
      status: 'available',
      reserved_by: null,
      reserved_at: null 
    })
    .eq('id', bookId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);
  return data;
}


export const borrowBook = async (bookId: string, userId: string) => {
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('status, stock_count, title')
    .eq('id', bookId)
    .single();

  if (bookError || !book) throw new Error("ไม่พบข้อมูลหนังสือ");
  if (book.status !== 'available' || book.stock_count <= 0) {
    throw new Error("ขออภัย หนังสือเล่มนี้ไม่พร้อมให้ยืมในขณะนี้");
  }

  const { error: updateError } = await supabase
    .from('books')
    .update({ 
      status: book.stock_count === 1 ? 'borrowed' : 'available',
      stock_count: book.stock_count - 1 
    })
    .eq('id', bookId);

  if (updateError) throw new Error("ไม่สามารถอัปเดตสถานะหนังสือได้");

  
  const { data: borrowing, error: borrowError } = await supabase
    .from('borrowings')
    .insert([{
      user_id: userId,
      book_id: bookId,
      borrow_date: new Date(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // กำหนดส่งใน 7 วัน
      status: 'active'
    }])
    .select()
    .single();

  if (borrowError) throw new Error("ไม่สามารถบันทึกข้อมูลการยืมได้");

  return borrowing;
}

export const returnBookLogic = async (borrowId: string, userId: string) => {
  const { data: borrowing, error } = await supabase
    .from('borrowings')
    .select('*')
    .eq('id', borrowId)
    .eq('user_id', userId) // ตรวจสอบความเป็นเจ้าของ
    .eq('status', 'active')
    .single();

  if (error || !borrowing) throw new Error("ไม่พบรายการยืมที่ถูกต้อง");

  
  await supabase.from('books')
    .update({ status: 'available' }) // หรือเพิ่ม stock_count: +1
    .eq('id', borrowing.book_id);


  const { data: result } = await supabase
    .from('borrowings')
    .update({ 
      status: 'returned', 
      return_date: new Date() 
    })
    .eq('id', borrowId)
    .select();

  return result;
}

export const calculateDueDate = (role: string) => {
  if (role === 'Instructor') return 30; // อาจารย์ยืมได้ 30 วัน
  if (role === 'Student') return 7;     // นักเรียนยืมได้ 7 วัน
  return 0;
};