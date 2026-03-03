-- ENABLE RLS
alter table profiles enable row level security;
alter table books enable row level security;
alter table loans enable row level security;
alter table reservations enable row level security;
alter table fines enable row level security;
alter table audit_logs enable row level security;


-- PROFILE
create policy "Users view own profile"
on profiles
for select using (auth.uid() = id);

create policy "Users update own profile"
on profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- BOOKS
create policy "Anyone can view books"
on books
for select
using (true);

-- LOANS
create policy "Users or staff view loans"
on loans
for select
using (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff','admin')
  )
);

-- RESERVATION FIX
create policy "Users manage own reservations"
on reservations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- FINES
create policy "Users view own fines"
on fines
for select using (auth.uid() = user_id);

-- audit logs
create policy "Users view own audit logs"
on audit_logs
for select using (auth.uid() = user_id);

create policy "Users or staff view audit logs"
on audit_logs
for select
using (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff','admin')
  )
);