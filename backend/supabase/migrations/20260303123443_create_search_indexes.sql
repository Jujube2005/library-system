create index idx_books_search
on books
using gin (to_tsvector('english', title || ' ' || author));