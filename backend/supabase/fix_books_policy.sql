-- Allow everyone to read books
create policy "Anyone can view books"
on public.books
for select using (true);

-- Enable RLS just in case it wasn't but was acting like it was
alter table public.books enable row level security;
