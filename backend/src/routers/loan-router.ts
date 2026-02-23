import { Router } from 'express'
import { viewMyLoans } from '../controllers/loan-controller'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import { returnBook } from '../controllers/book-controller'

const router = Router()

router.post(
    '/renew/:loanId',
    protect,
    authorize('user'),
    returnBook
)

router.get(
    '/my-loans',
    protect,
    authorize('user'),
    viewMyLoans
)

export default router
