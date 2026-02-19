insert into public.categories (name)
values
('Computer Science'),
('Mathematics'),
('History'),
('Engineering');



insert into public.books (title, author, total_copies, available_copies)
values
('Database Systems', 'Elmasri', 5, 5),
('Operating Systems', 'Silberschatz', 3, 3),
('Linear Algebra', 'Gilbert Strang', 4, 4);

update public.users
set role = 'admin'
where email = 'admin@library.com';
