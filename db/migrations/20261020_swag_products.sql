-- MW Fitness swag catalogue. Prepared only; do not apply to shared Neon without approval.
CREATE TABLE IF NOT EXISTS public.swag_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'apparel',
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  compare_at_price numeric(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  image_url text NOT NULL DEFAULT '',
  product_url text NOT NULL DEFAULT '',
  sizes text[] NOT NULL DEFAULT '{}'::text[],
  stock_status text NOT NULL DEFAULT 'available' CHECK (stock_status IN ('available','limited','sold_out','preorder','enquiry_only')),
  active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS swag_products_public_sort_idx ON public.swag_products (active, sort_order, name);
ALTER TABLE public.swag_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read active swag products" ON public.swag_products;
CREATE POLICY "public read active swag products" ON public.swag_products FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "staff manage swag products" ON public.swag_products;
CREATE POLICY "staff manage swag products" ON public.swag_products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','coach')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','coach')));
GRANT SELECT ON public.swag_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.swag_products TO authenticated;

-- Seed the four products already advertised on the website. Pricing and stock are
-- intentionally marked enquiry-only because no confirmed prices, sizes or stock
-- quantities have been supplied yet.
INSERT INTO public.swag_products
  (slug,name,description,category,price,image_url,product_url,sizes,stock_status,active,sort_order)
VALUES
  ('classic-shwag-t-shirt','Classic SHWAG T-Shirt','Price and availability on request. Send an enquiry to confirm current sizes, colours and stock.','apparel',0,'','',ARRAY[]::text[],'enquiry_only',true,10),
  ('shwag-hoodie','SHWAG Hoodie','Price and availability on request. Send an enquiry to confirm current sizes, colours and stock.','apparel',0,'','',ARRAY[]::text[],'enquiry_only',true,20),
  ('shwag-gym-bag','SHWAG Gym Bag','Price and availability on request. Send an enquiry to confirm current stock and options.','accessories',0,'','',ARRAY[]::text[],'enquiry_only',true,30),
  ('shwag-water-bottle','SHWAG Water Bottle','Price and availability on request. Send an enquiry to confirm current stock and options.','accessories',0,'','',ARRAY[]::text[],'enquiry_only',true,40)
ON CONFLICT (slug) DO NOTHING;
