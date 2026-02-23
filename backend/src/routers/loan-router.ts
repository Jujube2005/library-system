import { Router } from 'express'
import { createLoan, viewMyLoans, viewAllLoans, returnLoan, renewLoanHandler } from '../controllers/loan-controller'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'

const router = Router()

router.post(
  '/',
  protect,
  authorize('staff'),
  createLoan
)

router.get(
  '/my',
  protect,
  authorize('student', 'instructor'),
  viewMyLoans
)

router.get(
  '/',
  protect,
  authorize('staff'),
  viewAllLoans
)

router.post(
  '/:id/return',
  protect,
  authorize('staff'),
  returnLoan
)

router.post(
  '/:id/renew',
  protect,
  authorize('instructor'),
  renewLoanHandler
)

export default router
