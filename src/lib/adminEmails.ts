// The only accounts permitted to hold Staff HQ admin access (and to request
// staff password resets). Single source of truth for the client-side gates —
// keep in sync with db/migrations/20261020_staff_admin_allowlist.sql, which is
// what actually promotes the matching profiles to role 'admin' in Neon.
export const AUTHORISED_ADMIN_EMAILS = new Set([
  'instantonlinesuccess@gmail.com',
  'mwfitnessukonline@gmail.com',
]);

export const isAuthorisedAdminEmail = (email: string | null | undefined): boolean =>
  AUTHORISED_ADMIN_EMAILS.has(String(email || '').trim().toLowerCase());
