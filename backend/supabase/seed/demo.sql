-- ==============================
-- DEMO ENVIRONMENT
-- ==============================

-- STAFF DEMO
INSERT INTO profiles (id, full_name, email, role)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Demo Staff', 'staff@demo.com', 'staff');

-- STUDENTS DEMO
INSERT INTO profiles (id, student_id, full_name, email, role)
VALUES
('22222222-2222-2222-2222-222222222222', '65010001', 'Somchai Demo', 'student1@demo.com', 'student'),
('33333333-3333-3333-3333-333333333333', '65010002', 'Suda Demo', 'student2@demo.com', 'student');

-- BOOKS DEMO
INSERT INTO books (title, author, isbn, category, shelf_location, total_copies, available_copies)
VALUES
('Database Systems', 'Ramez Elmasri', '9780133970777', 'Computer Science', 'CS-01', 5, 5),
('Introduction to Algorithms', 'CLRS', '9780262033848', 'Computer Science', 'CS-02', 3, 3),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Software', 'SE-01', 4, 4);