ALTER TABLE public.loans
ADD CONSTRAINT fk_loans_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE RESTRICT;

ALTER TABLE public.loans
ADD CONSTRAINT fk_loans_book
FOREIGN KEY (book_id)
REFERENCES public.books(id)
ON DELETE RESTRICT;

ALTER TABLE public.reservations
ADD CONSTRAINT fk_res_book
FOREIGN KEY (book_id)
REFERENCES public.books(id)
ON DELETE CASCADE;