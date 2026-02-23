-- =========================
-- VIEW: users alias (legacy compatibility)
-- =========================

DROP VIEW IF EXISTS public.users;

CREATE VIEW public.users AS
SELECT * FROM public.profiles;
