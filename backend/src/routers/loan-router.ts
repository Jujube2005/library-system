import { Router } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import {
  viewMyLoans,
  viewAllLoans,
  createLoan,
  returnLoan,
  renewLoanHandler,
  renewLoanByStaff,
  getLoanById
} from '../controllers/loan-controller'

const router = Router()

// User routes
router.get('/my', protect, viewMyLoans)
router.patch('/:id/renew', protect, renewLoanHandler)

// Staff routes
router.get('/system', protect, authorize('staff'), viewAllLoans)
router.get('/', protect, authorize('staff'), viewAllLoans)
router.get('/:id', protect, authorize('staff'), getLoanById)
router.post('/', protect, authorize('staff'), createLoan)
router.patch('/:id/return', protect, authorize('staff'), returnLoan)
router.patch('/:id/renew-by-staff', protect, authorize('staff'), renewLoanByStaff)

export default router
