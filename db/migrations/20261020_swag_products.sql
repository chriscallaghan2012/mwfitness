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
  stock_status text NOT NULL DEFAULT 'available' CHECK (stock_status IN ('available','limited','sold_out','preorder')),
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
