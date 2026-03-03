DROP TRIGGER IF EXISTS trg_set_reservation_expiry ON reservations;

CREATE TRIGGER trg_set_reservation_expiry
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION set_reservation_expiry();