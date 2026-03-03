-- =========================
-- FIX: Add all missing columns to tables
-- =========================

-- Fix books table - add missing columns
-- 1. Add column if missing
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 2. Fill null rows
UPDATE public.books
SET category = 'General'
WHERE category IS NULL;

-- 3. Enforce NOT NULL
ALTER TABLE public.books
ALTER COLUMN category SET NOT NULL;

-- Fix loans table - ensure status column exists
UPDATE public.loans
SET status = 'active'
WHERE status IS NULL;

ALTER TABLE public.loans
ALTER COLUMN status TYPE loan_status_enum
USING status::loan_status_enum;

-- Fix reservations table - ensure status column exists
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS status reservation_status_enum DEFAULT 'pending' NOT NULL;

-- Fix fines table - ensure status column exists
ALTER TABLE public.fines
ADD COLUMN IF NOT EXISTS status fine_status_enum DEFAULT 'unpaid' NOT NULL;
