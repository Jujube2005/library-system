import { Request, Response } from 'express'
import * as bookService from '../services/book-service'

export async function searchBooks(req: Request, res: Response): Promise<void> {
  try {
    const supabase = (req as any).supabase

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : ''
    const page = Number(req.query.page ?? 1) || 1
    const limit = Number(req.query.limit ?? 10) || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('books')
      .select('id, title, author, category, available_copies, total_copies, status', { count: 'exact' })

    if (q) {
      query = query.ilike('title', `%${q}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      res.status(500).json({ error: error.message })
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
    const supabase = (req as any).supabase

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const { id } = req.params

    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, category, shelf_location, available_copies, total_copies, status')
      .eq('id', id)
      .single()

    if (error || !data) {
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
