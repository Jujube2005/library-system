import { Router } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'

const router = Router()

router.use(protect, authorize('staff'))

export default router
