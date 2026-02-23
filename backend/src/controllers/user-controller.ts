import { Request, Response } from 'express'
import { UserRole } from '../types/user'
import * as userService from '../services/user-service'

type AuthenticatedRequest = Request & {
    user?: {
        id: string
        role: UserRole
    }
}

export async function getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.id

        if (!userId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' })
            return
        }

        const profile = await userService.getUserProfile(userId)
        res.json(profile)
    } catch (error) {
        res.status(404).json({
            error: error instanceof Error ? error.message : 'Profile not found'
        })
    }
}
