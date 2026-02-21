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

create policy "read categories"
on public.categories
for select
using (true);

create policy "staff manage categories"
on public.categories
for all
using (public.get_user_role() in ('staff','admin'));

create policy "read books"
on public.books
for select
using (true);

create policy "staff manage books"
on public.books
for all
using (public.get_user_role() in ('staff','admin'));

create policy "student view own borrow"
on public.borrow_records
for select
using (auth.uid() = user_id);

create policy "student borrow"
on public.borrow_records
for insert
with check (auth.uid() = user_id);

create policy "staff manage borrow"
on public.borrow_records
for all
using (public.get_user_role() in ('staff','admin'));

create policy "user own reservation"
on public.reservations
for select
using (auth.uid() = user_id);

create policy "user create reservation"
on public.reservations
for insert
with check (auth.uid() = user_id);

create policy "staff manage reservation"
on public.reservations
for all
using (public.get_user_role() in ('staff','admin'));

create policy "user view own fines"
on public.fines
for select
using (
  exists (
    select 1 from public.borrow_records b
    where b.id = borrow_id
    and b.user_id = auth.uid()
  )
);

create policy "admin manage fines"
on public.fines
for all
using (public.get_user_role() = 'admin');

create policy "user own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

create policy "admin create notification"
on public.notifications
for insert
with check (public.get_user_role() = 'admin');


alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.borrow_records enable row level security;
alter table public.reservations enable row level security;
alter table public.fines enable row level security;
alter table public.notifications enable row level security;

