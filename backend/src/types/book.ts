export type BookStatus = 'available' | 'borrowed' | 'reserved' | 'lost';

export interface Book {
  id: string;
  title: string;
  status: BookStatus;
  due_date?: string; // ถ้าถูกยืม อาจจะมีวันกำหนดส่ง
}