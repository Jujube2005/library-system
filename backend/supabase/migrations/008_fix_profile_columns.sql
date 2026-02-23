-- =========================
-- FIX: Add back profile columns lost during type recreation
-- =========================

-- Add role column if missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role role_enum DEFAULT 'student' NOT NULL;

-- Ensure is_active column exists and is properly set
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Add status columns to other tables if missing
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS status book_status_enum DEFAULT 'available' NOT NULL;

ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS status loan_status_enum DEFAULT 'active' NOT NULL;

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS status reservation_status_enum DEFAULT 'pending' NOT NULL;

ALTER TABLE public.fines
ADD COLUMN IF NOT EXISTS status fine_status_enum DEFAULT 'unpaid' NOT NULL;
