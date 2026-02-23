import { Router, Response } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import { listUsers, updateUserRole, updateUserStatus } from '../services/user-service'

const router = Router()

router.use(protect, authorize('staff'))

router.get('/users', async (req: any, res: Response) => {
  try {
    const supabase = req.supabase

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const users = await listUsers(supabase)

    res.json({
      data: users
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/users/:id/role', async (req: any, res: Response) => {
  try {
    const supabase = req.supabase

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const { id } = req.params
    const { role } = req.body as { role?: 'student' | 'instructor' | 'staff' }

    if (!id) {
      res.status(400).json({ error: 'MISSING_USER_ID' })
      return
    }

    if (!role) {
      res.status(400).json({ error: 'MISSING_ROLE' })
      return
    }

    const user = await updateUserRole(supabase, id, role)

    res.json({
      data: user
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/users/:id/status', async (req: any, res: Response) => {
  try {
    const supabase = req.supabase

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const { id } = req.params
    const { is_active } = req.body as { is_active?: boolean }

    if (!id) {
      res.status(400).json({ error: 'MISSING_USER_ID' })
      return
    }

    if (typeof is_active !== 'boolean') {
      res.status(400).json({ error: 'MISSING_STATUS' })
      return
    }

    const user = await updateUserStatus(supabase, id, is_active)

    res.json({
      data: user
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router
