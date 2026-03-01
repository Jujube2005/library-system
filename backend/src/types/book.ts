export type BookStatus = 'available' | 'borrowed' | 'reserved' | 'lost' | 'unavailable';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  shelf_location: string;
  total_copies: number;
  available_copies: number;
  status: BookStatus;
  due_date?: string; // ถ้าถูกยืม อาจจะมีวันกำหนดส่ง
  created_at?: string;
  updated_at?: string;
  cover_image_url?: string;
}