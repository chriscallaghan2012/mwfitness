-- Restrict cross-profile updates to true admins.
-- public.is_admin() intentionally includes coaches for coaching workflows, so it
-- must not be used to authorize profile-wide updates or role changes.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$function$;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

DROP POLICY IF EXISTS "admins can update all profiles" ON public.profiles;

CREATE POLICY "admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());
