export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  student_id?: string;
  role: 'student' | 'instructor' | 'staff' | 'admin';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
