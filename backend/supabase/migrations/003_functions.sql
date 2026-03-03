

CREATE OR REPLACE FUNCTION set_reservation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NOW() + INTERVAL '48 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION process_return(p_loan_id UUID)
RETURNS VOID AS $$
DECLARE
  v_due DATE;
  v_return DATE := CURRENT_DATE;
  v_user UUID;
  v_book UUID;
  v_amount DECIMAL;
BEGIN
  -- Lock loan row
  SELECT due_date, user_id, book_id
  INTO v_due, v_user, v_book
  FROM loans
  WHERE id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;

  -- Update loan only if active
  UPDATE loans
  SET return_date = v_return,
      status = 'returned'
  WHERE id = p_loan_id
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan already returned';
  END IF;

  -- Increase available copies
  UPDATE books
  SET available_copies = available_copies + 1
  WHERE id = v_book;

  -- Calculate fine
  v_amount := calculate_fine(v_due, v_return);

  IF v_amount > 0 THEN
    INSERT INTO fines (loan_id, user_id, amount)
    VALUES (p_loan_id, v_user, v_amount);
  END IF;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION borrow_book(p_book_id UUID)
RETURNS VOID AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT available_copies
  INTO v_available
  FROM books
  WHERE id = p_book_id
  FOR UPDATE;

  IF v_available <= 0 THEN
    RAISE EXCEPTION 'Book not available';
  END IF;

  UPDATE books
  SET available_copies = available_copies - 1
  WHERE id = p_book_id;

  INSERT INTO loans (
    book_id,
    user_id,
    issued_by,
    due_date
  )
  VALUES (
    p_book_id,
    auth.uid(),
    auth.uid(),
    CURRENT_DATE + INTERVAL '7 days'
  );
END;
$$ LANGUAGE plpgsql;

create or replace function calculate_fine(p_borrow_id uuid)
returns numeric
language plpgsql
as $$
declare
  days_late integer;
begin
  select greatest(0, date_part('day', now() - due_date))
  into days_late
  from borrowings
  where id = p_borrow_id;

  return days_late * 10;
end;
$$;