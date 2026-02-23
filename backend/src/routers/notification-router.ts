import { Router, Response } from 'express'
import { protect } from '../middleware/auth-middleware'
import { getMyNotifications, markNotificationAsRead } from '../services/notification-service'

const router = Router()

router.get(
  '/my',
  protect,
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

      const notifications = await getMyNotifications(supabase, userId)

      res.json({
        data: notifications
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

router.patch(
  '/:id/read',
  protect,
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

      const { id } = req.params

      if (!id) {
        res.status(400).json({ error: 'MISSING_NOTIFICATION_ID' })
        return
      }

      const notification = await markNotificationAsRead(supabase, id, userId)

      res.json({
        data: notification
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

export default router

