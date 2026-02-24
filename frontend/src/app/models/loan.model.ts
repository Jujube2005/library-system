export interface Loan {
  id: string
  book_id: string
  user_id: string
  issued_by: string
  loan_date: string
  due_date: string
  return_date: string | null
  status: string
  current_fine?: number
  book?: {
    title?: string
  }
  user?: {
    full_name?: string
    role?: string
    email?: string
  }
}

