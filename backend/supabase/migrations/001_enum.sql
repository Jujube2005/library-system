create type user_role as enum (
  'student',
  'instructor',
  'staff',
  'admin'
);

create type borrow_status as enum (
  'borrowed',
  'returned',
  'overdue'
);

create type reservation_status as enum (
  'active',
  'expired',
  'cancelled'
);