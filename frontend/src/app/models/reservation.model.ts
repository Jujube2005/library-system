export interface Reservation {
  id: string
  book_id: string
  user_id: string
  status: string
  reserved_at: string
  expires_at: string | null
}

