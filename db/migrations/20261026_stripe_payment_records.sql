-- Stripe payment receipt ledger for the embedded Checkout webhook.
-- PREPARED ONLY: review and apply to the intended Neon branch with explicit approval.
-- This records verified paid Checkout Sessions for reconciliation. It deliberately
-- does not grant membership access: customer account linking must be verified first.

CREATE TABLE IF NOT EXISTS public.stripe_payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  stripe_event_id text NOT NULL,
  stripe_event_type text NOT NULL,
  stripe_payment_intent_id text,
  plan_id text NOT NULL,
  customer_email text,
  customer_name text,
  amount_total integer,
  currency text NOT NULL,
  payment_status text NOT NULL CHECK (payment_status IN ('paid')),
  membership_status text NOT NULL DEFAULT 'pending_account_link'
    CHECK (membership_status IN ('pending_account_link', 'manual_review', 'provisioned', 'refunded')),
  livemode boolean NOT NULL,
  review_reason text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stripe_payment_records_status_created_idx
  ON public.stripe_payment_records (membership_status, created_at DESC);

CREATE INDEX IF NOT EXISTS stripe_payment_records_email_idx
  ON public.stripe_payment_records (lower(customer_email));

ALTER TABLE public.stripe_payment_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.stripe_payment_records FROM PUBLIC;
REVOKE ALL ON TABLE public.stripe_payment_records FROM anon;
REVOKE ALL ON TABLE public.stripe_payment_records FROM authenticated;

COMMENT ON TABLE public.stripe_payment_records IS
  'Server-only ledger of Stripe-paid checkout sessions; does not itself grant coaching membership access.';
