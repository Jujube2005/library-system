-- =========================
-- FIX: Add all missing columns to tables
-- =========================

-- Fix books table - add missing columns
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS shelf_location VARCHAR(50),
ADD COLUMN IF NOT EXISTS status book_status_enum DEFAULT 'available' NOT NULL;

-- Fix loans table - ensure status column exists
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS status loan_status_enum DEFAULT 'active' NOT NULL;

-- Fix reservations table - ensure status column exists
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS status reservation_status_enum DEFAULT 'pending' NOT NULL;

-- Fix fines table - ensure status column exists
ALTER TABLE public.fines
ADD COLUMN IF NOT EXISTS status fine_status_enum DEFAULT 'unpaid' NOT NULL;
