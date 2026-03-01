-- =========================
-- BORROW BOOK FUNCTION
-- =========================

CREATE OR REPLACE FUNCTION borrow_book(
  p_user_id UUID,
  p_book_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_loan_id UUID;
  v_unpaid_count INTEGER;
  v_current_loans INTEGER;
  v_available INTEGER;
  v_reservation RECORD;
  v_role TEXT;
  v_loan_limit INTEGER;
BEGIN
  -- =====================
  -- 1. Check user role
  -- =====================
  SELECT role INTO v_role
  FROM profiles
  WHERE id = p_user_id;

  IF v_role = 'student' THEN
    v_loan_limit := 5;
  ELSIF v_role = 'instructor' THEN
    v_loan_limit := 10;
  ELSE
    v_loan_limit := 20;
  END IF;

  -- =====================
  -- 2. Check unpaid fine
  -- =====================
  SELECT COUNT(*)
  INTO v_unpaid_count
  FROM fines
  WHERE user_id = p_user_id
    AND status = 'unpaid';

  IF v_unpaid_count > 0 THEN
    RAISE EXCEPTION 'User has unpaid fines';
  END IF;

  -- =====================
  -- 3. Check loan limit
  -- =====================
  SELECT COUNT(*)
  INTO v_current_loans
  FROM loans
  WHERE user_id = p_user_id
    AND status = 'active';

  IF v_current_loans >= v_loan_limit THEN
    RAISE EXCEPTION 'Loan limit reached';
  END IF;

  -- =====================
  -- 4. Lock book row
  -- =====================
  SELECT available_copies
  INTO v_available
  FROM books
  WHERE id = p_book_id
  FOR UPDATE;

  IF v_available <= 0 THEN
    RAISE EXCEPTION 'Book not available';
  END IF;

  -- =====================
  -- 5. Reservation priority
  -- =====================
  SELECT *
  INTO v_reservation
  FROM reservations
  WHERE book_id = p_book_id
    AND status IN ('pending', 'ready')
  ORDER BY reserved_at
  LIMIT 1
  FOR UPDATE;

  IF v_reservation IS NOT NULL THEN
    IF v_reservation.user_id <> p_user_id THEN
      RAISE EXCEPTION 'Book reserved by another user';
    END IF;

    UPDATE reservations
    SET status = 'fulfilled'
    WHERE id = v_reservation.id;
  END IF;

  -- =====================
  -- 6. Create loan
  -- =====================
  INSERT INTO loans (
    book_id,
    user_id,
    issued_by,
    due_date
  )
  VALUES (
    p_book_id,
    p_user_id,
    p_user_id,
    CURRENT_DATE + INTERVAL '14 days'
  )
  RETURNING id INTO v_loan_id;

  -- =====================
  -- 7. Update stock
  -- =====================
  UPDATE books
  SET available_copies = available_copies - 1
  WHERE id = p_book_id;

  RETURN v_loan_id;
END;
$$ LANGUAGE plpgsql;