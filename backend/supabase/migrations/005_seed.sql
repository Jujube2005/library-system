INSERT INTO public.books (title, author, isbn, category, shelf_location, total_copies, available_copies)
VALUES
  ('Database Systems', 'Elmasri', '9780000000011', 'Computer Science', 'CS-001', 5, 5),
  ('Operating Systems', 'Silberschatz', '9780000000012', 'Computer Science', 'CS-002', 3, 3),
  ('Linear Algebra', 'Gilbert Strang', '9780000000013', 'Mathematics', 'MATH-001', 4, 4);

UPDATE public.profiles
SET role = 'staff'
WHERE email = 'admin@library.com';
