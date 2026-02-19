create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
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


create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
