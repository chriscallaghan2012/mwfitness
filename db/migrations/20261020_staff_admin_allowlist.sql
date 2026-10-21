-- MW Fitness named Staff HQ administrators.
-- PREPARED ONLY: do not apply to the shared Neon database without explicit approval.
--
-- Creates/verifies nothing in Neon Auth itself: sign up (or be invited) with each
-- address in Neon Auth FIRST — the profiles trigger then creates the profile row —
-- and only afterwards run this script to promote those profiles to 'admin'.
-- Run it in the Neon SQL editor; it prints one NOTICE per account so you can see
-- exactly which addresses were promoted and which have no profile yet.

DO $$
DECLARE
  target text;
  updated int;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'instantonlinesuccess@gmail.com',
    'mwfitnessukonline@gmail.com'
  ] LOOP
    UPDATE public.profiles
    SET role = 'admin'
    WHERE lower(trim(email)) = target;

    GET DIAGNOSTICS updated = ROW_COUNT;

    IF updated > 0 THEN
      RAISE NOTICE 'ADMIN PROMOTED: %', target;
    ELSE
      RAISE NOTICE 'NOT PROMOTED — no profile row for % yet. Create the account in Neon Auth (sign up / invite), sign in once, then re-run this script.', target;
    END IF;
  END LOOP;
END $$;

