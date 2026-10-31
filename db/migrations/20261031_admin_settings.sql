-- Shared Staff HQ settings used by live and demo-compatible admin controls.
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members can read cardio activity options" ON public.admin_settings;
CREATE POLICY "members can read cardio activity options" ON public.admin_settings FOR SELECT TO authenticated
  USING (key = 'cardio_activity_options');
DROP POLICY IF EXISTS "staff manage admin settings" ON public.admin_settings;
CREATE POLICY "staff manage admin settings" ON public.admin_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','coach')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','coach')));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO authenticated;

INSERT INTO public.admin_settings (key, value)
VALUES ('cardio_activity_options', '[
  {"id":"Treadmill","label":"Treadmill Run/Walk","icon":"directions_run","active":true},
  {"id":"Outdoor Run","label":"Outdoor Running","icon":"directions_run","active":true},
  {"id":"Outdoor Walk","label":"Outdoor Walking","icon":"directions_walk","active":true},
  {"id":"Stationary Bike","label":"Stationary Bike / Spin","icon":"pedal_bike","active":true},
  {"id":"Road Cycling","label":"Outdoor Cycling","icon":"directions_bike","active":true},
  {"id":"Rowing Machine","label":"Rowing Machine","icon":"rowing","active":true},
  {"id":"Stair Climber","label":"Stair Climber / Stepper","icon":"stairs","active":true},
  {"id":"Elliptical","label":"Elliptical Trainer","icon":"fitness_center","active":true},
  {"id":"Swimming","label":"Swimming Laps","icon":"pool","active":true},
  {"id":"HIIT Session","label":"HIIT / Circuit Cardio","icon":"bolt","active":true},
  {"id":"Jump Rope","label":"Jump Rope","icon":"fitness_center","active":true},
  {"id":"Other","label":"Other Activity","icon":"sports","active":true}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;
