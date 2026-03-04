import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'
import { supabaseAdmin } from '../config/supabase-admin'
import { UserRole } from '../types/user'

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error || !user) {
      res.status(401).json({ message: 'Invalid token' })
      return
    }

    // Use admin client for profile check to BE FAST (bypasses RLS overhead)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      res.status(403).json({ message: 'Access denied: Profile not found' })
      return
    }

    if (profile.is_active === false) {
      res.status(403).json({ message: 'Account is inactive' })
      return
    }

    const userPayload = {
      id: profile.id,
      role: profile.role as UserRole
    };

    (req as any).user = userPayload;
    (req as any).supabase = supabase;
    (req as any).supabaseAdmin = supabaseAdmin;

    next()
  } catch (err) {
    console.error('Auth Middleware Error:', err)
    res.status(500).json({ message: 'Internal server error during authentication' })
  }
}
