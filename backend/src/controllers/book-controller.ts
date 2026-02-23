import { Request, Response } from 'express'
import * as bookService from '../services/book-service'

export async function searchBooks(req: Request, res: Response): Promise<void> {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''

    if (!query) {
      res.status(400).json({ message: 'Query is required' })
      return
    }

    const books = await bookService.searchBooksFromAPI(query)
    res.json(books)
  } catch (_error) {
    res.status(500).json({ error: 'Search failed' })
  }
}

export const getStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const bookStatus = await bookService.getBookStatusById(id)

    res.status(200).json(bookStatus)
  } catch (error: any) {
    res.status(404).json({ message: 'Book not found', error: error.message })
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
