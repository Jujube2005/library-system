import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import { UserRole } from '../types/user'
// สมมติใช้ supabase.auth.getUser(token) หรือ jwt.verify()
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })


  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ message: 'Invalid token' })


  const { data: userRow, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || !userRow?.role) {
    return res.status(403).json({ message: 'Access denied: No role assigned' })
  }


  ; (req as any).user = { ...user, role: userRow.role as UserRole }
  next()
}
