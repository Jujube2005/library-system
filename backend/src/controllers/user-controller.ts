import { Request, Response } from 'express'
import { UserRole } from '../types/user'
import * as userService from '../services/user-service'

type AuthenticatedRequest = Request & {
  user?: {
    id: string
    role: UserRole
  }
  supabase?: unknown
}

export async function getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    const supabase = req.supabase

    if (!userId) {
      res.status(401).json({ error: 'UNAUTHENTICATED' })
      return
    }

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const profile = await userService.getUserProfile(supabase as any, userId)
    res.json(profile)
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : 'Profile not found'
    })
  }
}

export async function updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    const supabase = req.supabase
    const { full_name, phone, student_id } = req.body as {
      full_name?: string
      phone?: string
      student_id?: string
    }

    if (!userId) {
      res.status(401).json({ error: 'UNAUTHENTICATED' })
      return
    }

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const profile = await userService.updateMyProfile(supabase as any, userId, {
      full_name,
      phone,
      student_id
    })

    res.json(profile)
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Unable to update profile'
    })
  }
}
