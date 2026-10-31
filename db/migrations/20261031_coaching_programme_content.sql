-- Optional reusable content attached to a coaching programme.
CREATE TABLE IF NOT EXISTS public.coaching_programme_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.coaching_programmes(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('workout_template','exercise','nutrition_template','supplement')),
  content_id text NOT NULL,
  content_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programme_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS coaching_programme_content_programme_idx
  ON public.coaching_programme_content (programme_id, content_type, sort_order, content_name);

ALTER TABLE public.coaching_programme_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members can view attached programme content" ON public.coaching_programme_content;
CREATE POLICY "members can view attached programme content"
  ON public.coaching_programme_content FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.coaching_programme_assignments a
    WHERE a.programme_id = coaching_programme_content.programme_id AND a.profile_id = auth.uid()
  ));
DROP POLICY IF EXISTS "staff can manage attached programme content" ON public.coaching_programme_content;
CREATE POLICY "staff can manage attached programme content"
  ON public.coaching_programme_content FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaching_programme_content TO authenticated;
