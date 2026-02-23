export type UserRole = 'student' | 'instructor' | 'staff' | 'admin'

export type BorrowStatus = 'borrowed' | 'returned' | 'overdue'

export type ReservationStatus = 'active' | 'expired' | 'cancelled'

export interface User {
  id: string
  username: string | null
  display_name: string | null
  email: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  title: string
  author: string | null
  isbn: string | null
  category_id: string | null
  total_copies: number
  available_copies: number
  created_at: string
  updated_at: string
}

export interface BorrowRecord {
  id: string
  user_id: string
  book_id: string
  start_date: string
  due_date: string | null
  return_date: string | null
  status: BorrowStatus
  fine_amount: number | null
  payment_status: string | null
  updated_at: string
}

export interface Reservation {
  id: string
  user_id: string
  book_id: string
  reserved_at: string
  status: ReservationStatus
  updated_at: string
}

export interface Fine {
  id: string
  borrow_id: string
  amount: number
  paid: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  notification_type: string
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
}

