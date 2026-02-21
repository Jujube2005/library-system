create or replace function public.handle_borrow_stock()
returns trigger as $$
begin

  -- prevent borrow when no stock
  if (tg_op = 'INSERT') then
    if (
      select available_copies 
      from public.books 
      where id = new.book_id
    ) <= 0 then
      raise exception 'Book out of stock';
    end if;

    -- decrease stock
    update public.books
    set available_copies = available_copies - 1
    where id = new.book_id;
  end if;


  -- when return → increase stock
  if (tg_op = 'UPDATE') then
    if old.status = 'borrowed' and new.status = 'returned' then
      update public.books
      set available_copies = available_copies + 1
      where id = new.book_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;


create trigger borrow_stock_trigger
after insert or update on public.borrow_records
for each row
execute procedure public.handle_borrow_stock();
