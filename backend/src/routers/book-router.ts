import { Router } from 'express'
import {
  checkBook,
  getStatus,
  searchBooks
} from '../controllers/book-controller'
import { protect } from '../middleware/auth-middleware'

const router = Router()

router.get('/', protect, searchBooks)
router.get('/:id', protect, getStatus)
router.get('/:id/check', protect, checkBook)

export default router
