-- 20261021_coaching_videos.sql
-- Video demonstration library for exercise technique and coaching tutorials.
-- Shared between MW Fitness website Staff HQ and MW-FITNESS-APP-MOBILE.

CREATE TABLE IF NOT EXISTS public.coaching_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Technique',
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer,
  level text NOT NULL DEFAULT 'All levels',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coaching_videos_active_created_idx
  ON public.coaching_videos(active, created_at DESC);

ALTER TABLE public.coaching_videos ENABLE ROW LEVEL SECURITY;

-- Active videos are readable by signed-in members and visitors
DROP POLICY IF EXISTS "active coaching videos are readable" ON public.coaching_videos;
CREATE POLICY "active coaching videos are readable"
  ON public.coaching_videos
  FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- Staff can view and manage all coaching videos
DROP POLICY IF EXISTS "admins can manage coaching videos" ON public.coaching_videos;
CREATE POLICY "admins can manage coaching videos"
  ON public.coaching_videos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS coaching_videos_set_updated_at ON public.coaching_videos;
CREATE TRIGGER coaching_videos_set_updated_at
  BEFORE UPDATE ON public.coaching_videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.coaching_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaching_videos TO authenticated;
