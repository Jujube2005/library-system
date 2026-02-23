CREATE OR REPLACE FUNCTION set_reservation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NOW() + INTERVAL '48 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_fine(
  p_due_date DATE,
  p_return_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  overdue_days INTEGER;
BEGIN
  overdue_days := GREATEST(p_return_date - p_due_date, 0);
  RETURN overdue_days * 5;
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
  SELECT due_date, user_id, book_id
  INTO v_due, v_user, v_book
  FROM loans WHERE id = p_loan_id;

  UPDATE loans
  SET return_date = v_return,
      status = 'returned'
  WHERE id = p_loan_id;

  UPDATE books
  SET available_copies = available_copies + 1
  WHERE id = v_book;

  v_amount := calculate_fine(v_due, v_return);

  IF v_amount > 0 THEN
    INSERT INTO fines (loan_id, user_id, amount)
    VALUES (p_loan_id, v_user, v_amount);
  END IF;
END;
$$ LANGUAGE plpgsql;
