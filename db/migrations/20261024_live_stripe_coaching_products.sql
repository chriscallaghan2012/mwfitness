-- Link active online coaching plans to their live Stripe Product and Price objects.
-- Safe to re-run: adds the nullable product id column and updates only the five
-- active online plan IDs. Inactive legacy plans are deliberately untouched.
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS stripe_product_id text;

UPDATE public.plans
SET stripe_product_id = CASE id
  WHEN 'online-4-week-once' THEN 'prod_VUwCKNbA1FcChL'
  WHEN 'online-bronze-4week' THEN 'prod_VUwCZoIOMLoBja'
  WHEN 'online-silver-8week' THEN 'prod_VUwCHDYA0CUhvM'
  WHEN 'online-gold-8week' THEN 'prod_VUwCXP5DBiksXh'
  WHEN 'online-platinum-8week' THEN 'prod_VUwCzCZfuJTMMT'
  ELSE stripe_product_id
END,
stripe_price_id = CASE id
  WHEN 'online-4-week-once' THEN 'price_1UTwK1QDsc6YS5mtunlNI2z6'
  WHEN 'online-bronze-4week' THEN 'price_1UTwK9QDsc6YS5mtq7dHDQB1'
  WHEN 'online-silver-8week' THEN 'price_1UTwKBQDsc6YS5mtS91W8VOI'
  WHEN 'online-gold-8week' THEN 'price_1UTwKDQDsc6YS5mtiey7mxDs'
  WHEN 'online-platinum-8week' THEN 'price_1UTwKFQDsc6YS5mtmFFDl1Uw'
  ELSE stripe_price_id
END
WHERE id IN (
  'online-4-week-once',
  'online-bronze-4week',
  'online-silver-8week',
  'online-gold-8week',
  'online-platinum-8week'
)
  AND kind = 'online'
  AND active = true;
