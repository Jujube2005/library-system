

insert into public.categories (name)
values
('Computer Science'),
('Mathematics'),
('History'),
('Engineering');


insert into public.books (title, author, category_id, total_copies, available_copies)
values
('Database Systems', 'Elmasri', 1, 5, 5),
('Operating Systems', 'Silberschatz', 1, 3, 3),
('Linear Algebra', 'Gilbert Strang', 2, 4, 4);

update public.users
set role = 'admin'
where email = 'admin@library.com';
