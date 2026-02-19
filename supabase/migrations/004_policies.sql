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

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.borrow_records enable row level security;
alter table public.reservations enable row level security;
alter table public.fines enable row level security;
alter table public.notifications enable row level security;

