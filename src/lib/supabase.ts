// Shared Neon Auth + Data API client for the MW Fitness website and staff panel.
// The legacy filename/export is retained during the migration to keep imports stable.
import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL ?? '';
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL ?? '';

export const isNeonConfigured = Boolean(authUrl && dataApiUrl);

export const neon = isNeonConfigured
  ? createClient({
      auth: {
        adapter: SupabaseAuthAdapter(),
        url: authUrl,
      },
      dataApi: {
        url: dataApiUrl,
      },
    })
  : null;

// Compatibility alias while components are moved to the shared Neon client.
export const supabase = neon;
export const isSupabaseConfigured = isNeonConfigured;
