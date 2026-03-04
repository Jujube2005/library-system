-- Add multiple mock books for testing
INSERT INTO public.books (title, author, isbn, category, shelf_location, total_copies, available_copies)
VALUES 
('The Art of Living', 'Marcus Aurelius', '9780140449334', 'Philosophy', 'PHL-01', 10, 10),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Technical', 'CS-02', 5, 5),
('Digital Minimalism', 'Cal Newport', '9780525536512', 'Lifestyle', 'LFS-01', 3, 3),
('The Design of Everyday Things', 'Don Norman', '9780465050659', 'Design', 'DSN-01', 8, 8),
('Brief Answers to the Big Questions', 'Stephen Hawking', '9781473695986', 'Science', 'SCI-01', 12, 12),
('Thinking, Fast and Slow', 'Daniel Kahneman', '9780374275631', 'Psychology', 'PSY-01', 7, 7),
('Atomic Habits', 'James Clear', '9780735211292', 'Productivity', 'PRD-01', 15, 15),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '9780062316097', 'History', 'HST-01', 9, 9),
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Literature', 'LIT-01', 4, 4);
