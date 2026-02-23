-- Reservation expiry trigger
CREATE TRIGGER trg_set_reservation_expiry
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION set_reservation_expiry();