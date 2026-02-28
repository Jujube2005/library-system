import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import * as staffService from '../services/staff-service'
import * as loanService from '../services/loan-service' // เพิ่ม import loanService
import { env } from '../config/env'

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

        const result = await loanService.createLoan(targetUserId, bookId, staffId) // เรียกใช้ loanService.createLoan

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

        const result = await loanService.returnLoan(borrowId) // เรียกใช้ loanService.returnLoan

        res.status(200).json({
            message: 'บันทึกการคืนโดย Staff สำเร็จ',
            data: result
        })
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

export const inviteUser = async (req: Request, res: Response) => {
  try {
    if (!env.supabaseServiceRoleKey) {
      res.status(500).json({ error: 'SERVICE_ROLE_KEY_NOT_CONFIGURED' })
      return
    }

    const { email, fullName, role } = req.body as {
      email?: string
      fullName?: string
      role?: string
    }

    if (!email || !fullName || !role) {
      res.status(400).json({ error: 'MISSING_FIELDS' })
      return
    }

    const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

    if (error || !data?.user) {
      res.status(400).json({ error: error?.message ?? 'INVITE_FAILED' })
      return
    }

    const userId = data.user.id

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role,
        is_active: true
      })

    if (profileError) {
      res.status(400).json({ error: profileError.message })
      return
    }

    res.status(201).json({
      data: {
        id: userId,
        email,
        fullName,
        role
      }
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

