// Shared Neon Auth + Data API client for the MW Fitness website and staff panel.
import { createClient, SupabaseAuthAdapter as NeonAuthAdapter } from '@neondatabase/neon-js';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL ?? '';
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL ?? '';

export const isNeonConfigured = Boolean(authUrl && dataApiUrl);

export const neon = isNeonConfigured
  ? createClient({
      auth: {
        adapter: NeonAuthAdapter(),
        url: authUrl,
        // Public pages (including pricing) must be able to query public Neon rows
        // before a visitor signs in. Database grants/RLS still govern what is readable.
        allowAnonymous: true,
      },
      dataApi: {
        url: dataApiUrl,
      },
    })
  : null;

