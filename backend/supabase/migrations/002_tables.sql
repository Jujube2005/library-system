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

-- =========================
-- NOTIFICATIONS
-- =========================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  notification_type TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
