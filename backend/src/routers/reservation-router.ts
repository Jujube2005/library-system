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
      const { bookId } = req.body as { bookId?: string }

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
          book_id: bookId
        })
        .select('id, book_id, status, reserved_at')
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

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          books (
            title,
            author,
            category
          )
        `)
        .eq('user_id', userId)
        .order('reserved_at', { ascending: false })

      if (error) {
        console.error('Reservations Query Error:', error)
        res.status(400).json({ error: error.message, details: error.details })
        return
      }

      res.json({ data: data ?? [] })
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
