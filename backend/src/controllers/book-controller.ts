import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'
import * as bookService from '../services/book-service'
import { Book } from '../types/book'

export async function searchBooks(req: Request, res: Response): Promise<void> {
  try {
    console.log('searchBooks: starting query...')
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : ''
    const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : ''
    const page = Number(req.query.page ?? 1) || 1
    const limit = Number(req.query.limit ?? 10) || 10
    console.log(`[Backend] Searching books: q="${q}", cat="${category}", page=${page}`)

    const publicSupabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = publicSupabase
      .from('books')
      .select('*', { count: 'exact' })

    if (q) {
      query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query
      .range(from, to)
      .order('title', { ascending: true })

    console.log(`[Backend] Query finished. Found ${data?.length} results. Total count: ${count}`)

    if (error) {
      console.error('Supabase Search Error:', error)
      res.status(400).json({ error: error.message, details: error.details })
      return
    }

    res.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? data?.length ?? 0
      }
    })
  } catch (_error) {
    res.status(500).json({ error: 'Search failed' })
  }
}

export const getStatus = async (req: Request, res: Response) => {
  try {
    const publicSupabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
    const { id } = req.params

    const { data, error } = await publicSupabase
      .from('books')
      .select('id, title, author, category, shelf_location, available_copies, total_copies, status, cover_image_url')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Get Book Error:', error)
      res.status(404).json({ error: 'BOOK_NOT_FOUND' })
      return
    }

    res.status(200).json({ data })
  } catch (_error) {
    res.status(500).json({ error: 'Failed to load book' })
  }
}

export const checkBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await bookService.checkAvailability(id)
    res.json(result)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
}

export const reserve = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const userId = user?.id as string | undefined

    if (!userId) {
      res.status(401).json({ message: 'UNAUTHENTICATED' })
      return
    }

    const { bookId } = req.body as { bookId?: string }

    if (!bookId) {
      res.status(400).json({ message: 'bookId is required' })
      return
    }

    const reservation = await bookService.reserveBook(userId, bookId)
    res.status(201).json(reservation)
  } catch (error: any) {
    res.status(400).json({ message: 'Reservation failed', error: error.message })
  }
}

export const cancelMyReservation = async (req: any, res: Response) => {
  try {
    const { bookId } = req.body // หรือรับจาก req.params ก็ได้
    const userId = req.user.id   // ได้มาจาก protect middleware

    const result = await bookService.cancelReservation(bookId, userId)

    res.json({
      message: "ยกเลิกการจองสำเร็จ",
      data: result
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const borrow = async (req: any, res: Response) => {
  try {
    const { bookId } = req.body
    const userId = req.user.id // ดึงจาก protect middleware

    const result = await bookService.borrowBook(bookId, userId)

    res.status(201).json({
      message: "ยืมหนังสือสำเร็จ กรุณาส่งคืนตามกำหนด",
      data: result
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const returnBook = async (req: any, res: Response) => {
  try {
    const { borrowId } = req.body
    const userId = req.user.id

    const result = await bookService.returnBookLogic(borrowId, userId)

    res.json({
      message: "คืนหนังสือสำเร็จ",
      data: result
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const createBook = async (req: Request, res: Response) => {
  try {
    const bookData = req.body as Omit<Book, 'id' | 'created_at' | 'updated_at'>
    // Use the authenticated supabase client if available, or fall back to service role logic
    const supabaseClient = (req as any).supabase
    const result = await bookService.createBook(bookData, supabaseClient)

    res.status(201).json({
      data: result
    })
  } catch (error: any) {
    console.error('Create Book Error:', error)
    res.status(400).json({ 
      error: error.message || 'Create Book Failed', 
      details: error.details, 
      hint: error.hint,
      code: error.code 
    })
  }
}

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ error: 'MISSING_BOOK_ID' })
      return
    }

    const updateData = req.body as Partial<Book>
    const supabaseClient = (req as any).supabase
    const result = await bookService.updateBookInfo(id, updateData, supabaseClient)

    res.status(200).json({
      data: result
    })
  } catch (error: any) {
<<<<<<< HEAD
    console.error('SERVER UPDATE BOOK HTTP ERROR:', error);
    res.status(400).json({ error: error.message || String(error) })
=======
    console.error('Update Book Error:', error)
    res.status(400).json({ 
      error: error.message || 'Update Book Failed', 
      details: error.details, 
      hint: error.hint,
      code: error.code 
    })
>>>>>>> 7479f8e69e6f112165719a63ec688f5b62fb9e1a
  }
}

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ error: 'MISSING_BOOK_ID' })
      return
    }

    const supabaseClient = (req as any).supabase
    const result = await bookService.deleteBook(id, supabaseClient)

    res.status(200).json({
      data: result
    })
  } catch (error: any) {
    console.error('Delete Book Error:', error)
    res.status(400).json({ 
      error: error.message || 'Delete Book Failed', 
      details: error.details, 
      hint: error.hint,
      code: error.code 
    })
  }
}

export const updateBookCopies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { change } = req.body as { change?: number }

    if (!id) {
      res.status(400).json({ error: 'MISSING_BOOK_ID' })
      return
    }
    if (typeof change !== 'number') {
      res.status(400).json({ error: 'CHANGE_AMOUNT_REQUIRED' })
      return
    }

    const supabaseClient = (req as any).supabase
    const result = await bookService.updateBookCopies(id, change, supabaseClient)

    res.status(200).json({
      data: result
    })
  } catch (error: any) {
    console.error('Update Book Copies Error:', error)
    res.status(400).json({ 
      error: error.message || 'Update Book Copies Failed', 
      details: error.details, 
      hint: error.hint,
      code: error.code 
    })
  }
}
