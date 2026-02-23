import { Router } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import { viewAllLoans } from '../controllers/loan-controller'
import { recordBorrow, recordReturn } from '../controllers/staff-controller'

const router = Router()

router.get(
    '/all-loans',
    protect,
    authorize('staff'),
    viewAllLoans
)

router.post(
    '/record-borrow',
    protect,
    authorize('staff'),
    recordBorrow
)

router.post(
    '/record-return',
    protect,
    authorize('staff'),
    recordReturn
)

export default router
