
-- 1.enums for user roles, borrow status, and reservation status
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

-- 2. tables for users, categories, books, borrow records, reservations, fines, and notifications
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

-- 3. FUNCTION TO HANDLE NEW USER CREATION
-- ========================================
-- AUTO CREATE USER PROFILE AFTER SIGNUP
-- ========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'student');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.get_user_role()
returns user_role as $$
  select role from public.users
  where id = auth.uid();
$$ language sql stable;


-- 4. TRIGGER TO AUTOMATICALLY CREATE USER PROFILES
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy "user can view own profile"
on public.users
for select
using (auth.uid() = id);

create policy "admin full access"
on public.users
for all
using (public.get_user_role() = 'admin');

create policy "user borrow own"
on public.borrow_records
for select
using (auth.uid() = user_id);


alter table public.borrow_records enable row level security;
alter table public.reservations enable row level security;
alter table public.fines enable row level security;

