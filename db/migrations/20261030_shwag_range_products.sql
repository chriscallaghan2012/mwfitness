-- Correct the public SHWAG range to the three products requested.
-- Prepared migration only: do not apply to shared Neon without explicit approval.
UPDATE public.swag_products
SET active = false, updated_at = now()
WHERE slug IN ('classic-shwag-t-shirt','shwag-gym-bag','shwag-water-bottle');

INSERT INTO public.swag_products
  (slug, name, description, category, price, image_url, product_url, sizes, stock_status, active, sort_order)
VALUES
  ('shwag-hoodie', 'SHWAG Hoodie', 'SHWAG Hoodie. Price shown is a temporary placeholder and will be updated.', 'apparel', 50.00, '', '', ARRAY[]::text[], 'enquiry_only', true, 10),
  ('shwag-tshirt', 'SHWAG Tshirt', 'SHWAG Tshirt. Price shown is a temporary placeholder and will be updated.', 'apparel', 50.00, '', '', ARRAY[]::text[], 'enquiry_only', true, 20),
  ('shwag-cap', 'SHWAG Cap', 'SHWAG Cap. Price shown is a temporary placeholder and will be updated.', 'accessories', 50.00, '', '', ARRAY[]::text[], 'enquiry_only', true, 30)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock_status = 'enquiry_only',
  active = true,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
