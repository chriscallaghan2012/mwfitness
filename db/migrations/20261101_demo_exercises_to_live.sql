-- Copy default demo exercises into live workout_exercises table.
-- These are the same 5 exercises seeded in Staff HQ demo mode:
-- Barbell Bench Press, Incline Dumbbell Press, Chest Supported T-Bar Row,
-- Standing Dumbbell Lateral Raise, Overhead Rope Extension.
--
-- Idempotent: safe to re-run (ON CONFLICT DO UPDATE on id).

INSERT INTO public.workout_exercises
  (id, name, category, description, coach_cues, result_fields, default_prescription, sort_order, active, created_at, updated_at)
VALUES
  ('14000000-0000-4000-8000-000000000001', 'Barbell Bench Press', 'Chest', 'Horizontal barbell press.', 'Set the shoulder blades before the lift.',
   '[{"key":"sets","label":"Sets","type":"number"},{"key":"reps","label":"Reps","type":"number"},{"key":"load","label":"Load","type":"number","unit":"kg"}]'::jsonb,
   '{"sets":4,"reps":"6-8"}'::jsonb, 10, true, now(), now()),
  ('14000000-0000-4000-8000-000000000002', 'Incline Dumbbell Press', 'Chest', 'Incline dumbbell press.', 'Use a controlled lowering phase.',
   '[{"key":"sets","label":"Sets","type":"number"},{"key":"reps","label":"Reps","type":"number"},{"key":"load","label":"Load","type":"number","unit":"kg"}]'::jsonb,
   '{"sets":3,"reps":"8-10"}'::jsonb, 20, true, now(), now()),
  ('14000000-0000-4000-8000-000000000003', 'Chest Supported T-Bar Row', 'Back', 'Chest-supported horizontal row.', 'Keep the chest supported throughout.',
   '[{"key":"sets","label":"Sets","type":"number"},{"key":"reps","label":"Reps","type":"number"},{"key":"load","label":"Load","type":"number","unit":"kg"}]'::jsonb,
   '{"sets":4,"reps":"10-12"}'::jsonb, 30, true, now(), now()),
  ('14000000-0000-4000-8000-000000000004', 'Standing Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell lateral raise.', 'Raise under control without swinging.',
   '[{"key":"sets","label":"Sets","type":"number"},{"key":"reps","label":"Reps","type":"number"},{"key":"load","label":"Load","type":"number","unit":"kg"}]'::jsonb,
   '{"sets":4,"reps":"15"}'::jsonb, 40, true, now(), now()),
  ('14000000-0000-4000-8000-000000000005', 'Overhead Rope Extension', 'Arms', 'Overhead cable triceps extension.', 'Keep the upper arms steady.',
   '[{"key":"sets","label":"Sets","type":"number"},{"key":"reps","label":"Reps","type":"number"},{"key":"load","label":"Load","type":"number","unit":"kg"}]'::jsonb,
   '{"sets":3,"reps":"12-15"}'::jsonb, 50, true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  coach_cues = EXCLUDED.coach_cues,
  result_fields = EXCLUDED.result_fields,
  default_prescription = EXCLUDED.default_prescription,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();