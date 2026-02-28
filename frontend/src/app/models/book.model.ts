export type BookStatus = 'available' | 'borrowed' | 'reserved' | 'lost' | 'unavailable';

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  shelf_location: string
  available_copies: number
  total_copies: number
  status: BookStatus
  created_at?: string
  updated_at?: string
}

