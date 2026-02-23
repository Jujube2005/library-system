import { Router } from 'express'
import {
  checkBook,
  getStatus,
  searchBooks,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/book-controller'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'

const router = Router()

router.get('/', protect, searchBooks)
router.get('/:id', protect, getStatus)
router.get('/:id/check', protect, checkBook)

router.post('/', protect, authorize('staff'), createBook)
router.patch('/:id', protect, authorize('staff'), updateBook)
router.delete('/:id', protect, authorize('staff'), deleteBook)

export default router
