-- =========================
-- ENUM ALIGNMENT (SRS v2.0)
-- =========================

DROP TYPE IF EXISTS reservation_status CASCADE;

CREATE TYPE reservation_status AS ENUM (
  'pending',
  'ready',
  'fulfilled',
  'cancelled',
  'expired'
);

-- USERS → PROFILES 
ALTER TABLE IF EXISTS users RENAME TO profiles;
-- BORROW → LOANS
ALTER TABLE IF EXISTS borrow_records RENAME TO loans;
-- RESERVATION → RESERVATIONS
ALTER TABLE IF EXISTS reservation_records RENAME TO reservations;

ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'fulfilled';
ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'expired';supabase db push --debug

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

CREATE OR REPLACE FUNCTION set_reservation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NOW() + INTERVAL '48 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservation_expiry ON reservations;

CREATE TRIGGER trg_reservation_expiry
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION set_reservation_expiry();

CREATE OR REPLACE FUNCTION check_reservation_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM reservations
  WHERE user_id = NEW.user_id
  AND status IN ('pending', 'ready');

  IF current_count >= 3 THEN
    RAISE EXCEPTION 'Reservation limit reached';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reservation_limit
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION check_reservation_limit();

CREATE OR REPLACE FUNCTION check_borrow_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_loans INT;
BEGIN
  SELECT COUNT(*) INTO active_loans
  FROM loans
  WHERE user_id = NEW.user_id
  AND return_date IS NULL;

  IF active_loans >= 5 THEN
    RAISE EXCEPTION 'Borrow limit exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_borrow_limit
BEFORE INSERT ON loans
FOR EACH ROW
EXECUTE FUNCTION check_borrow_limit();

CREATE TABLE IF NOT EXISTS fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_fine()
RETURNS TRIGGER AS $$
DECLARE
  overdue_days INT;
BEGIN
  IF NEW.return_date > NEW.due_date THEN
    overdue_days := DATE_PART('day', NEW.return_date - NEW.due_date);

    INSERT INTO fines (loan_id, amount)
    VALUES (NEW.id, overdue_days * 10)
    ON CONFLICT (loan_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_fine
AFTER UPDATE ON loans
FOR EACH ROW
WHEN (NEW.return_date IS NOT NULL)
EXECUTE FUNCTION generate_fine();


CREATE OR REPLACE FUNCTION expire_reservations()
RETURNS VOID AS $$
BEGIN
  UPDATE reservations
  SET status = 'expired'
  WHERE expires_at < NOW()
  AND status IN ('pending', 'ready');
END;
$$ LANGUAGE plpgsql;