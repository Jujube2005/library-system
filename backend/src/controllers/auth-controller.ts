import { Request, Response } from 'express'
import { login as loginService, logout as logoutService } from '../services/auth-service'

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email?: string; password?: string }

    const result = await loginService(email ?? '', password ?? '')
    res.json(result)
}

export async function logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization ?? ''
    const accessToken = authHeader.replace('Bearer ', '').trim()

    if (!accessToken) {
        res.status(400).json({
            success: false,
            message: 'Missing access token'
        })
        return
    }

    const result = await logoutService(accessToken)
    res.json(result)
}
