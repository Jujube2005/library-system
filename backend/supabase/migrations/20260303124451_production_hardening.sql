--- ===========================
---Constraints (ความถูกต้องของข้อมูล)
--- ============================
--- UNIQUE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'books_isbn_unique'
  ) THEN
    ALTER TABLE public.books
    ADD CONSTRAINT books_isbn_unique UNIQUE (isbn);
  END IF;
END$$;
-- NOT NULL
ALTER TABLE public.books
ALTER COLUMN title SET NOT NULL;

ALTER TABLE public.books
ALTER COLUMN isbn SET NOT NULL;

--CHECK (quantity ต้องไม่ติดลบ)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quantity_non_negative'
  ) THEN
    ALTER TABLE public.books
    ADD CONSTRAINT quantity_non_negative
    CHECK (quantity >= 0);
  END IF;
END$$;

--- ===========================
---Foreign Key + ON DELETE Rules
--- ============================

-- loans → user (ใช้ RESTRICT ปลอดภัยกว่า CASCADE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_loans_user'
  ) THEN
    ALTER TABLE public.loans
    ADD CONSTRAINT fk_loans_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE RESTRICT;
  END IF;
END$$;

-- loans → books
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_loans_book'
  ) THEN
    ALTER TABLE public.loans
    ADD CONSTRAINT fk_loans_book
    FOREIGN KEY (book_id)
    REFERENCES public.books(id)
    ON DELETE RESTRICT;
  END IF;
END$$;

-- reservations → books
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_res_book'
  ) THEN
    ALTER TABLE public.reservations
    ADD CONSTRAINT fk_res_book
    FOREIGN KEY (book_id)
    REFERENCES public.books(id)
    ON DELETE RESTRICT;
  END IF;
END$$;

--- ===========================
---Default Values
--- ===========================

-- books
ALTER TABLE public.books
ALTER COLUMN quantity SET DEFAULT 0;

-- loans
ALTER TABLE public.loans
ALTER COLUMN borrowed_at SET DEFAULT NOW();

ALTER TABLE public.loans
ALTER COLUMN status SET DEFAULT 'borrowed';

-- reservations
ALTER TABLE public.reservations
ALTER COLUMN reserved_at SET DEFAULT NOW();

ALTER TABLE public.reservations
ALTER COLUMN status SET DEFAULT 'pending';

-- audit_logs
ALTER TABLE public.audit_logs
ALTER COLUMN created_at SET DEFAULT NOW();

-- fines
ALTER TABLE public.fines
ALTER COLUMN status SET DEFAULT 'unpaid';

--- ===============================
---Audit Log Table
--- ===============================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  created_at timestamp DEFAULT NOW()
);

--- ===========================
---Row Level Security (RLS) Policies
--- ===========================
---Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

---Policies
-- Profiles
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Books
CREATE POLICY "Users view available books"
ON public.books
FOR SELECT
USING (quantity > 0);

-- Loans
CREATE POLICY "Users view own loans"
ON public.loans
FOR SELECT
USING (user_id = auth.uid());

-- Reservations
CREATE POLICY "Users manage own reservations"
ON public.reservations
FOR ALL
USING (user_id = auth.uid());

-- Fines
CREATE POLICY "Users view own fines"
ON public.fines
FOR SELECT
USING (user_id = auth.uid());
--- ===============================
---Index (Performance)
--- ===============================
CREATE INDEX IF NOT EXISTS idx_books_search
ON public.books
USING gin (to_tsvector('english', title || ' ' || author));

--- ===============================
---Business Logic Functions
--- ===============================
---Borrow Book
CREATE OR REPLACE FUNCTION borrow_book(p_book_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.books
  SET quantity = quantity - 1
  WHERE id = p_book_id
  AND quantity > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Book not available';
  END IF;

  INSERT INTO public.loans(user_id, book_id, borrowed_at, due_date)
  VALUES (auth.uid(), p_book_id, NOW(), NOW() + INTERVAL '7 days');
END;
$$;

---Return Book

CREATE OR REPLACE FUNCTION return_book(p_book_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.books
  SET quantity = quantity + 1
  WHERE id = p_book_id;

  UPDATE public.loans
  SET returned_at = NOW()
  WHERE book_id = p_book_id
  AND user_id = auth.uid()
  AND returned_at IS NULL;
END;
$$;

---Calculate Fine
CREATE OR REPLACE FUNCTION calculate_fine(p_loan_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  days_late integer;
BEGIN
  SELECT GREATEST(0, DATE_PART('day', NOW() - due_date))
  INTO days_late
  FROM public.loans
  WHERE id = p_loan_id;

  RETURN days_late * 10;
END;
$$;

