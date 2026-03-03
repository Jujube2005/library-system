-- Add expires_at safely
ALTER TABLE IF EXISTS public.reservations
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Drop trigger safely
DROP TRIGGER IF EXISTS trg_reservation_expiry ON public.reservations;

-- Create trigger only if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'reservations'
  ) THEN
    CREATE TRIGGER trg_reservation_expiry
    BEFORE INSERT ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION set_reservation_expiry();
  END IF;
END$$;