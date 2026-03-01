import { Router } from 'express'
import {
  checkBook,
  getStatus,
  searchBooks,
  createBook,
  updateBook,
  deleteBook,
  updateBookCopies
} from '../controllers/book-controller'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'

const router = Router()

router.get('/', searchBooks)
router.get('/:id', getStatus)
router.get('/:id/check', protect, checkBook)

router.post('/', protect, authorize('staff'), createBook)
router.patch('/:id', protect, authorize('staff'), updateBook)
router.delete('/:id', protect, authorize('staff'), deleteBook)
router.patch('/:id/copies', protect, authorize('staff'), updateBookCopies)

export default router
