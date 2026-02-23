export type UserRole = 'student' | 'instructor' | 'staff'

export interface Profile {
  id: string
  full_name: string
  email: string
  student_id: string | null
  phone: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

