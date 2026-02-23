import { Router } from 'express'
import {
  checkBook,
  getStatus,
  searchBooks,
  reserve,
  borrow,
  cancelMyReservation,
  returnBook
} from '../controllers/book-controller'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'

const router = Router()
router.get('/search', searchBooks)
router.get('/:id/status', getStatus)
router.get('/:id/check', checkBook)
router.post('/reserve', protect, reserve)
router.post('/borrow', protect, authorize('user'), borrow)
router.post('/cancel-reservation', protect, cancelMyReservation)
router.post('/return', protect, authorize('user'), returnBook)

export default router
