-- MW Fitness named Staff HQ administrators.
-- PREPARED ONLY: do not apply to the shared Neon database without explicit approval.
-- Create/verify both accounts in Neon Auth first. This promotes matching existing
-- public.profiles rows only; it does not create Neon Auth users or send invitations.
UPDATE public.profiles
SET role = 'admin'
WHERE lower(trim(email)) IN (
  'instantonlinesuccess@gmail.com',
  'mwfitnessukonline@gmail.com'
);
