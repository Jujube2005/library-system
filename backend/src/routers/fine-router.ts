import { Router, Response } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import { getMyFines, getAllFines, processPayment } from '../services/fine-service'
import { supabaseAdmin } from '../config/supabase-admin'
import { checkAndNotifyFine } from '../utils/notification'

const router = Router()

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

      await checkAndNotifyFine(userId)
      const fines = await getMyFines(supabase, userId)

      res.json({ data: fines })
    } catch (error: any) {
      console.error('Fines Query Error:', error)
      res.status(400).json({ error: error.message })
    }
  }
)

router.get(
  '/',
  protect,
  authorize('staff'),
  async (req: any, res: Response) => {
    try {
      const fines = await getAllFines(supabaseAdmin)
      res.json({ data: fines })
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

      if (!id) {
        res.status(400).json({ error: 'MISSING_FINE_ID' })
        return
      }

      const fine = await processPayment(supabaseAdmin, id)

      res.json({ data: fine })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

export default router

