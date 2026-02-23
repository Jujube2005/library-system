-- ==============================
-- TEST ENVIRONMENT
-- ==============================

-- STAFF
INSERT INTO profiles (id, full_name, email, role)
VALUES 
('aaaaaaa1-1111-1111-1111-aaaaaaaaaaaa', 'Test Staff', 'staff@test.com', 'staff');

-- STUDENT
INSERT INTO profiles (id, student_id, full_name, email, role)
VALUES
('bbbbbbb2-2222-2222-2222-bbbbbbbbbbbb', '65019999', 'Test Student', 'student@test.com', 'student');

-- BOOKS (ใช้ทดสอบ)
INSERT INTO books (title, author, isbn, category, shelf_location, total_copies, available_copies)
VALUES
('Test Book 1', 'Tester', '1111111111', 'Test', 'T-01', 1, 1),
('Test Book 2', 'Tester', '2222222222', 'Test', 'T-02', 1, 1);