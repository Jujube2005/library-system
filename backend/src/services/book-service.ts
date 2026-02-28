import axios from 'axios'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'
import { env } from '../config/env'
import { Book, BookStatus } from '../types/book'

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
      console.error('Supabase Update Copies Error:', error);
      throw { 
        message: error.message, 
        details: error.details, 
        hint: error.hint,
        code: error.code 
      };
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
export const createBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>, supabaseClient?: any) => {
  console.log('--- START BOOK SERVICE createBook ---');
  // 1. Use the provided authenticated client
  // 2. Or use a new admin client if service role key exists
  // 3. Or fall back to the global anon client
  const client = supabaseClient || (env.supabaseServiceRoleKey 
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    : supabase);
    
  if (!env.supabaseServiceRoleKey && !supabaseClient) {
    console.warn('WARNING: No service role key and no auth client. This will likely fail due to RLS.');
  }

  // Ensure we only insert valid columns to avoid 400 errors from Supabase
  const isbn = bookData.isbn ? bookData.isbn.replace(/[-\s]/g, '') : null;
  
  const insertData = {
    title: bookData.title.trim(),
    author: bookData.author.trim(),
    isbn: isbn && isbn.length > 0 ? isbn : null,
    category: bookData.category.trim(),
    shelf_location: bookData.shelf_location.trim(),
    total_copies: Number(bookData.total_copies),
    available_copies: Number(bookData.total_copies),
    status: (Number(bookData.total_copies) > 0 ? 'available' : 'unavailable') as BookStatus
  }

  console.log('Inserting into Supabase:', JSON.stringify(insertData));

  const { data, error } = await client
    .from('books')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Supabase Insert Error detail:', error);
    // Throw an object that matches the structure expected by the controller
    throw { 
      message: error.message, 
      details: error.details, 
      hint: error.hint,
      code: error.code 
    };
  }

  console.log('Supabase insert success');
  return data
}

export const updateBookInfo = async (bookId: string, updateData: Partial<Book>, supabaseClient?: any) => {
  const client = supabaseClient || (env.supabaseServiceRoleKey 
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    : supabase);

  // Filter out invalid columns
  const validColumns = ['title', 'author', 'isbn', 'category', 'shelf_location', 'total_copies', 'available_copies', 'status']
  const filteredData: Record<string, any> = {}
  
  for (const key of validColumns) {
    if (key in updateData) {
      const value = (updateData as any)[key]
      if (key === 'isbn') {
        const cleanedIsbn = typeof value === 'string' ? value.replace(/[-\s]/g, '') : value
        filteredData[key] = cleanedIsbn && cleanedIsbn.length > 0 ? cleanedIsbn : null
      } else if (key === 'total_copies' || key === 'available_copies') {
        filteredData[key] = Number(value)
      } else if (typeof value === 'string') {
        filteredData[key] = value.trim()
      } else {
        filteredData[key] = value
      }
    }
  }

  const { data, error } = await client
    .from('books')
    .update(filteredData)
    .eq('id', bookId)
    .select()
    .single()

  if (error) {
    console.error('Supabase Update Error:', error);
    throw { 
      message: error.message, 
      details: error.details, 
      hint: error.hint,
      code: error.code 
    };
  }

  return data
}

export const deleteBook = async (bookId: string, supabaseClient?: any) => {
  const client = supabaseClient || (env.supabaseServiceRoleKey 
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    : supabase);

  const { data: loans, error: loanError } = await client
    .from('loans')
    .select('id')
    .eq('book_id', bookId)
    .neq('status', 'returned')

  if (loanError) throw new Error(loanError.message)
  if (loans && loans.length > 0) {
    throw new Error('ไม่สามารถลบหนังสือได้ เนื่องจากมีการยืมหรือจองค้างอยู่')
  }

  const { error } = await client
    .from('books')
    .delete()
    .eq('id', bookId)

  if (error) {
    console.error('Supabase Delete Error:', error);
    throw { 
      message: error.message, 
      details: error.details, 
      hint: error.hint,
      code: error.code 
    };
  }

  return { message: 'ลบหนังสือสำเร็จ' }
}

export const updateBookCopies = async (bookId: string, change: number, supabaseClient?: any) => {
  const client = supabaseClient || (env.supabaseServiceRoleKey 
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    : supabase);

  const { data: currentBook, error: fetchError } = await client
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

  const { data, error } = await client
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
      console.error('Supabase Update Copies Error (New Staff):', error);
      throw { 
        message: error.message, 
        details: error.details, 
        hint: error.hint,
        code: error.code 
      };
    }
  
    return data
  }