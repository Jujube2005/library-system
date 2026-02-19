

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


create table public.users (
  id uuid primary key references auth.users(id),
  username text unique,
  display_name text,
  email text unique,
  role user_role default 'student',
  created_at timestamptz default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);


create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  isbn text unique,
  category_id uuid references public.categories(id),
  total_copies int default 1,
  available_copies int default 1,
  created_at timestamptz default now()
);

create table public.borrow_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  book_id uuid references public.books(id),
  start_date timestamptz default now(),
  due_date timestamptz,
  return_date timestamptz,
  status borrow_status default 'borrowed',
  fine_amount numeric,
  payment_status text
);


create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  book_id uuid references public.books(id),
  reserved_at timestamptz default now(),
  status reservation_status default 'active'
);


create table public.fines (
  id uuid primary key default gen_random_uuid(),
  borrow_id uuid references public.borrow_records(id),
  amount numeric,
  paid boolean default false,
  created_at timestamptz default now()
);


create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  notification_type text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);




alter table public.borrow_records enable row level security;
alter table public.reservations enable row level security;
alter table public.fines enable row level security;

