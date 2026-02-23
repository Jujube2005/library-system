<<<<<<< HEAD
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
=======
create type user_role as enum (
  'student',
  'instructor',
  'staff',
  'admin'
);

create type borrow_status as enum (
  'borrowed',
>>>>>>> 5ca0ff5f5837a9afd664b560f1769471e2f3f5ab
  'returned',
  'overdue'
);

<<<<<<< HEAD
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
=======
create type reservation_status as enum (
  'active',
  'expired',
  'cancelled'
>>>>>>> 5ca0ff5f5837a9afd664b560f1769471e2f3f5ab
);