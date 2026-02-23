<<<<<<< HEAD
-- =========================
-- PROFILES
-- =========================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  role role_enum NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- BOOKS
-- =========================

CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  author VARCHAR(500) NOT NULL,
  isbn VARCHAR(13) UNIQUE,
  category VARCHAR(100) NOT NULL,
  shelf_location VARCHAR(50) NOT NULL,
  total_copies INTEGER NOT NULL CHECK (total_copies >= 0),
  available_copies INTEGER NOT NULL CHECK (available_copies >= 0),
  status book_status_enum DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (available_copies <= total_copies)
);

-- =========================
-- LOANS
-- =========================

CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  issued_by UUID NOT NULL REFERENCES profiles(id),
  loan_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status loan_status_enum DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- FINES
-- =========================

CREATE TABLE public.fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID UNIQUE REFERENCES loans(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10,2) CHECK (amount >= 0),
  status fine_status_enum DEFAULT 'unpaid',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- RESERVATIONS
-- =========================

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  status reservation_status_enum DEFAULT 'pending',
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);
=======



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



>>>>>>> 5ca0ff5f5837a9afd664b560f1769471e2f3f5ab
