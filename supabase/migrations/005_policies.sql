-- ENABLE RLS
alter table profiles enable row level security;
alter table loans enable row level security;
alter table reservations enable row level security;
alter table fines enable row level security;

-- PROFILE
create policy "Users view own profile"
on profiles
for select using (auth.uid() = id);

-- LOANS
create policy "Users view own loans"
on loans
for select using (auth.uid() = user_id);

-- RESERVATION
create policy "Users manage own reservations"
on reservations
for all using (auth.uid() = user_id);

-- FINES
create policy "Users view own fines"
on fines
for select using (auth.uid() = user_id);