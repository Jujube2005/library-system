-- =========================
-- ENUM TYPES
-- =========================

CREATE TYPE role_enum AS ENUM (
  'student',
  'instructor',
  'staff'
);

CREATE TYPE book_status_enum AS ENUM (
  'available',
  'borrowed',
  'reserved',
  'unavailable'
);

CREATE TYPE loan_status_enum AS ENUM (
  'active',
  'returned',
  'overdue'
);

CREATE TYPE fine_status_enum AS ENUM (
  'unpaid',
  'paid'
);

CREATE TYPE reservation_status_enum AS ENUM (
  'pending',
  'ready',
  'fulfilled',
  'cancelled',
  'expired'
);
