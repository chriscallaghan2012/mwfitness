-- Retire the legacy online catalogue after the confirmed 5-package catalogue
-- in 20261021_online_coaching_packages.sql is applied.
-- Keep old rows for historical membership references; do not delete them.
UPDATE public.plans
SET active = false
WHERE kind = 'online'
  AND id IN (
    'one-off-4-week',
    'bronze',
    'silver',
    'gold',
    'platinum',
    'online-weekly',
    'online-12-week'
  );
