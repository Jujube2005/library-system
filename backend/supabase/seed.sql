-- STAFF
INSERT INTO profiles (id, full_name, email, role)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Library Staff',
  'staff@rmuti.ac.th',
  'staff'
);

-- STUDENT
INSERT INTO profiles (id, student_id, full_name, email, role)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '65010001',
  'Somchai Student',
  'student@rmuti.ac.th',
  'student'
);

-- BOOK
INSERT INTO books (
  title, author, isbn,
  category, shelf_location,
  total_copies, available_copies
)
VALUES (
  'Database Systems',
  'Ramez Elmasri',
  '9780133970777',
  'Computer Science',
  'CS-01',
  5,
  5
);