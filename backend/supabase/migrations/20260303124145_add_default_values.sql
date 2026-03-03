-- books
ALTER TABLE IF EXISTS public.books
ALTER COLUMN quantity SET DEFAULT 0;

ALTER TABLE IF EXISTS public.books
ALTER COLUMN created_at SET DEFAULT NOW();

-- loans (แทน borrowings)
ALTER TABLE IF EXISTS public.loans
ALTER COLUMN borrowed_at SET DEFAULT NOW();

ALTER TABLE IF EXISTS public.loans
ALTER COLUMN status SET DEFAULT 'borrowed';

-- reservations
ALTER TABLE IF EXISTS public.reservations
ALTER COLUMN reserved_at SET DEFAULT NOW();

ALTER TABLE IF EXISTS public.reservations
ALTER COLUMN status SET DEFAULT 'pending';

-- audit_logs
ALTER TABLE IF EXISTS public.audit_logs
ALTER COLUMN created_at SET DEFAULT NOW();

-- fines
ALTER TABLE IF EXISTS public.fines
ALTER COLUMN status SET DEFAULT 'unpaid';