import { Book } from './book.model';
import { Profile } from './profile.model'; // Assuming a profile.model.ts will be created

export type LoanStatus = 'active' | 'returned' | 'overdue' | 'cancelled';

export interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  loan_date: string; // ISO date string
  due_date: string;  // ISO date string
  return_date: string | null; // ISO date string or null
  status: LoanStatus;
  issued_by?: string; // Staff ID ที่ออกการยืม
  created_at?: string;
  updated_at?: string;

  // Joined data (optional, for display purposes)
  books?: Book;
  user?: Profile[]; // Changed from Profile to Profile[] to match backend
}
