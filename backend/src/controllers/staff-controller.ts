import { Request, Response } from 'express'
import * as staffService from '../services/staff-service'

export const recordBorrow = async (req: any, res: Response) => {
    try {
        const staffId = req.user?.id as string | undefined
        const { targetUserId, bookId } = req.body as {
            targetUserId?: string
            bookId?: string
        }

        if (!staffId) {
            res.status(401).json({ message: 'UNAUTHENTICATED' })
            return
        }

        if (!targetUserId || !bookId) {
            res.status(400).json({ message: 'targetUserId and bookId are required' })
            return
        }

        const result = await staffService.recordBorrowByStaff(staffId, targetUserId, bookId)

        res.status(201).json({
            message: 'บันทึกการยืมโดย Staff สำเร็จ',
            data: result
        })
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

export const recordReturn = async (req: Request, res: Response) => {
    try {
        const { borrowId } = req.body as { borrowId?: string }

        if (!borrowId) {
            res.status(400).json({ message: 'borrowId is required' })
            return
        }

        const result = await staffService.recordReturnByStaff(borrowId)

        res.status(200).json({
            message: 'บันทึกการคืนโดย Staff สำเร็จ',
            data: result
        })
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

