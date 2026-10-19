-- MW Fitness live mobile nutrition support.
-- Prepared migration only: review and apply to the shared Neon database in an approved window.

ALTER TABLE public.nutrition_plans
  ADD COLUMN IF NOT EXISTS day_type text NOT NULL DEFAULT 'training';

ALTER TABLE public.nutrition_templates
  ADD COLUMN IF NOT EXISTS day_type text NOT NULL DEFAULT 'training';

DO $$
BEGIN
  ALTER TABLE public.nutrition_plans
    ADD CONSTRAINT nutrition_plans_day_type_check
    CHECK (day_type IN ('training', 'non_training'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.nutrition_templates
    ADD CONSTRAINT nutrition_templates_day_type_check
    CHECK (day_type IN ('training', 'non_training'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.nutrition_daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  day_type text NOT NULL CHECK (day_type IN ('training', 'non_training')),
  completed_meal_ids text[] NOT NULL DEFAULT '{}',
  completed_day boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nutrition_daily_logs_profile_date_type_key UNIQUE (profile_id, log_date, day_type)
);

CREATE INDEX IF NOT EXISTS nutrition_daily_logs_profile_date_idx
  ON public.nutrition_daily_logs (profile_id, log_date DESC);

ALTER TABLE public.nutrition_daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can manage own daily nutrition logs" ON public.nutrition_daily_logs;
CREATE POLICY "users can manage own daily nutrition logs"
  ON public.nutrition_daily_logs
  FOR ALL TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "admins can manage daily nutrition logs" ON public.nutrition_daily_logs;
CREATE POLICY "admins can manage daily nutrition logs"
  ON public.nutrition_daily_logs
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_daily_logs TO authenticated;

-- Allow an authenticated member to reply in their own coach conversation.
DROP POLICY IF EXISTS "athletes can send own coach messages" ON public.coach_messages;
CREATE POLICY "athletes can send own coach messages"
  ON public.coach_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = athlete_profile_id
    AND auth.uid() = sender_profile_id
    AND NOT is_admin()
  );

-- Staff need to read athlete replies as well as messages they authored.
DROP POLICY IF EXISTS "staff can read messages they sent" ON public.coach_messages;
DROP POLICY IF EXISTS "staff can read all coach messages" ON public.coach_messages;
CREATE POLICY "staff can read all coach messages"
  ON public.coach_messages
  FOR SELECT TO authenticated
  USING (is_admin());
