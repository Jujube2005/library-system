import { Router, Request, Response } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import * as staffService from '../services/staff-service'

const router = Router()

router.post(
  '/',
  protect,
  authorize('student', 'instructor', 'staff'),
  async (req: any, res: Response) => {
    try {
      const supabase = req.supabase

      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not available' })
        return
      }

      const userId = req.user?.id as string | undefined
      const { bookId, expiresAt } = req.body as { bookId?: string, expiresAt?: string }

      if (!userId) {
        res.status(401).json({ error: 'UNAUTHENTICATED' })
        return
      }

      if (!bookId) {
        res.status(400).json({ error: 'MISSING_BOOK_ID' })
        return
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: userId,
          book_id: bookId,
          expires_at: expiresAt
        })
        .select('id, book_id, status, reserved_at, expires_at')
        .single()

      if (error) {
        res.status(400).json({ error: error.message })
        return
      }

      res.status(201).json({ data })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

router.get(
  '/my',
  protect,
  authorize('student', 'instructor', 'staff'),
  async (req: any, res: Response) => {
    try {
      const supabase = req.supabase

      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not available' })
        return
      }

      const userId = req.user?.id as string | undefined

      if (!userId) {
        res.status(401).json({ error: 'UNAUTHENTICATED' })
        return
      }

      const { data: resvData, error: resvError } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId)
        .order('reserved_at', { ascending: false })

      if (resvError) {
        res.status(400).json({ error: resvError.message })
        return
      }

      if (!resvData || resvData.length === 0) {
        res.json({ data: [] })
        return
      }

      const bookIds = [...new Set(resvData.map((r: any) => r.book_id))]
      const { data: booksData } = await supabase
        .from('books')
        .select('id, title, author, category')
        .in('id', bookIds)

      const bookMap = new Map(booksData?.map((b: any) => [b.id, b]))

      const merged = resvData.map((r: any) => ({
        ...r,
        books: bookMap.get(r.book_id) // Match the key expected by existing frontend logic
      }))

      res.json({ data: merged })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

router.get(
  '/all',
  protect,
  authorize('staff'),
  async (req: any, res: Response) => {
    try {
      const supabase = req.supabase

      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not available' })
        return
      }

      const { data: resvData, error: resvError } = await supabase
        .from('reservations')
        .select('*')
        .order('reserved_at', { ascending: false })
        .limit(100)

      if (resvError) {
        res.status(400).json({ error: resvError.message })
        return
      }

      if (!resvData || resvData.length === 0) {
        res.json({ data: [] })
        return
      }

      // Collect unique IDs
      const userIds = [...new Set(resvData.map((r: any) => r.user_id))]
      const bookIds = [...new Set(resvData.map((r: any) => r.book_id))]

      // Fetch related data
      const [usersRes, booksRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, student_id').in('id', userIds),
        supabase.from('books').select('id, title, isbn, shelf_location').in('id', bookIds)
      ])

      const userMap = new Map(usersRes.data?.map((u: any) => [u.id, u]))
      const bookMap = new Map(booksRes.data?.map((b: any) => [b.id, b]))

      const merged = resvData.map((r: any) => ({
        ...r,
        user: userMap.get(r.user_id) || { full_name: 'Unknown', student_id: 'N/A' },
        book: bookMap.get(r.book_id) || { title: 'Unknown Book', shelf_location: 'N/A' }
      }))

      res.json({ data: merged })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

router.delete(
  '/:id',
  protect,
  authorize('student', 'instructor', 'staff'),
  async (req: any, res: Response) => {
    try {
      const supabase = req.supabase

      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not available' })
        return
      }

      const userId = req.user?.id as string | undefined
      const { id } = req.params

      if (!userId) {
        res.status(401).json({ error: 'UNAUTHENTICATED' })
        return
      }

      if (!id) {
        res.status(400).json({ error: 'MISSING_RESERVATION_ID' })
        return
      }

      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        res.status(400).json({ error: error.message })
        return
      }

      res.json({ data: { deleted: true } })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

router.patch(
  '/:id',
  protect,
  authorize('staff'),
  async (req: any, res: Response) => {
    try {
      const { id } = req.params
      const { status } = req.body as { status?: string }

      if (!id) {
        res.status(400).json({ error: 'MISSING_RESERVATION_ID' })
        return
      }

      if (!status) {
        res.status(400).json({ error: 'MISSING_STATUS' })
        return
      }

      const staffId = req.user?.id as string | undefined

      if (!staffId) {
        res.status(401).json({ error: 'UNAUTHENTICATED' })
        return
      }

      if (status === 'completed') {
        const result = await staffService.confirmReservationByStaff(id, staffId)
        res.json({ data: result })
        return
      }

      const supabase = req.supabase

      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not available' })
        return
      }

      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id)
        .select('id, status, updated_at')
        .single()

      if (error) {
        res.status(400).json({ error: error.message })
        return
      }

      res.json({ data })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

export default router
