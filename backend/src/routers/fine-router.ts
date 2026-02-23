import { Router } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import { Request, Response } from 'express'
import { processPayment } from '../services/fine-service'

const router = Router()

router.post(
    '/pay/:borrowId',
    protect,
    authorize('user'),
    async (req: Request, res: Response) => {
        try {
            const { borrowId } = req.params
            const userId = (req as any).user?.id as string | undefined

            if (!userId) {
                res.status(401).json({ message: 'UNAUTHENTICATED' })
                return
            }

            const result = await processPayment(borrowId, userId)
            res.json({
                message: 'ชำระค่าปรับสำเร็จ',
                data: result
            })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }
)

export default router
