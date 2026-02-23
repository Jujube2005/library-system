-- =========================
-- RLS POLICIES (NOTIFICATIONS)
-- =========================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

