


-- 2. tables for users, categories, books, borrow records, reservations, fines, and notifications
create table public.users (
  id uuid primary key references auth.users(id),
  username text unique,
  display_name text,
  email text unique,
  role user_role default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
  
);


create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  isbn text unique,
  category_id uuid references public.categories(id),
  total_copies int default 1,
  available_copies int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
  
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
  payment_status text,
  updated_at timestamptz default now()
);


create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  book_id uuid references public.books(id),
  reserved_at timestamptz default now(),
  status reservation_status default 'active',
  updated_at timestamptz default now()
  
);


create table public.fines (
  id uuid primary key default gen_random_uuid(),
  borrow_id uuid references public.borrow_records(id),
  amount numeric,
  paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  notification_type text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'student');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.get_user_role()
returns user_role
language sql
stable
as $$
  select role from public.users
  where id = auth.uid()
  limit 1;
$$;



